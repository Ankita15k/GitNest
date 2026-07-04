import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/responseHandlers.js';
import CIStatus from '../models/CIStatus.model.js';
import Repository from '../models/Repository.model.js';
import PullRequest from '../models/PullRequest.model.js';
import crypto from 'crypto';

const verifyGitHubSignature = (payload, secret, signature) => {
  if (!secret || !signature) return true;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const hash = `sha256=${hmac.digest('hex')}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash));
};

export const handleGitHubWebhook = asyncHandler(async (req, res) => {
  const payload = JSON.stringify(req.body);
  const signature = req.headers['x-hub-signature-256'];
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (secret && !verifyGitHubSignature(payload, secret, signature)) {
    return sendError(res, 401, 'Invalid webhook signature');
  }

  const { repository, check_run } = req.body;

  if (!repository || !check_run) {
    return sendError(res, 400, 'Missing required webhook fields');
  }

  const repo = await Repository.findOne({ fullName: repository.full_name });

  if (!repo) {
    return sendError(res, 404, 'Repository not found');
  }

  const pr = await PullRequest.findOne({
    repository: repo._id,
    headCommitSha: check_run.head_sha,
  });

  const ciStatus = await CIStatus.findOneAndUpdate(
    {
      repository: repo._id,
      commitSha: check_run.head_sha,
      checkName: check_run.name,
    },
    {
      status: check_run.conclusion || 'pending',
      provider: 'github',
      checkName: check_run.name,
      url: check_run.html_url,
      description: check_run.output?.title,
      detailsUrl: check_run.output?.summary,
      pullRequestId: pr?._id,
    },
    { upsert: true, new: true }
  );

  sendSuccess(res, 200, { ciStatus }, 'CI status recorded successfully');
});

export const handleGenericWebhook = asyncHandler(async (req, res) => {
  const { repositoryId, commitSha, status, provider, checkName, url, description } = req.body;

  if (!repositoryId || !commitSha || !status || !checkName) {
    return sendError(res, 400, 'Missing required fields');
  }

  const repo = await Repository.findById(repositoryId);

  if (!repo) {
    return sendError(res, 404, 'Repository not found');
  }

  const pr = await PullRequest.findOne({
    repository: repositoryId,
    headCommitSha: commitSha,
  });

  const ciStatus = await CIStatus.findOneAndUpdate(
    {
      repository: repositoryId,
      commitSha,
      checkName,
    },
    {
      status,
      provider: provider || 'other',
      checkName,
      url,
      description,
      pullRequestId: pr?._id,
    },
    { upsert: true, new: true }
  );

  sendSuccess(res, 200, { ciStatus }, 'CI status recorded successfully');
});

export const getCIStatus = asyncHandler(async (req, res) => {
  const { commitSha } = req.params;
  const { repositoryId } = req.query;

  if (!commitSha || !repositoryId) {
    return sendError(res, 400, 'Missing required parameters');
  }

  const statuses = await CIStatus.find({
    repository: repositoryId,
    commitSha,
  }).lean();

  const summary = {
    allPassed: statuses.length > 0 && statuses.every((s) => s.status === 'success'),
    hasFailed: statuses.some((s) => s.status === 'failure' || s.status === 'error'),
    isPending: statuses.some((s) => s.status === 'pending'),
    statuses,
  };

  sendSuccess(res, 200, summary, 'CI status retrieved');
});

export default {
  handleGitHubWebhook,
  handleGenericWebhook,
  getCIStatus,
};
