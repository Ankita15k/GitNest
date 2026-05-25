import mongoose from 'mongoose';
import PullRequest from '../models/PullRequest.model.js';
import Repository from '../models/Repository.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import paginate, { buildPaginationMeta } from '../utils/paginate.js';

const populatePullRequest = (query) =>
  query
    .populate('author', 'username avatarUrl')
    .populate('repository', 'name owner defaultBranch')
    .populate('comments.author', 'username avatarUrl')
    .populate('reviews.author', 'username avatarUrl');

const serializePullRequest = (pullRequest) => {
  const raw = typeof pullRequest.toObject === 'function'
    ? pullRequest.toObject({ virtuals: true })
    : pullRequest;

  return {
    ...raw,
    id: String(raw._id),
    fromBranch: raw.fromBranch || raw.sourceBranch,
    toBranch: raw.toBranch || raw.targetBranch,
  };
};

const resolveRepository = async (repositoryRef, repositoryId) => {
  const ref = repositoryId || repositoryRef;

  if (!ref) {
    throw new AppError('Repository is required', 400);
  }

  if (mongoose.Types.ObjectId.isValid(ref)) {
    const repository = await Repository.findById(ref);
    if (repository) return repository;
  }

  const repository = await Repository.findOne({ name: ref });
  if (!repository) {
    throw new AppError('Repository not found', 404);
  }

  return repository;
};

const findPullRequest = async (id) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? PullRequest.findById(id)
    : PullRequest.findOne({ number: Number(id) });

  const pullRequest = await populatePullRequest(query);
  if (!pullRequest) {
    throw new AppError('Pull request not found', 404);
  }

  return pullRequest;
};

const ensureOpen = (pullRequest) => {
  if (pullRequest.status !== 'open') {
    throw new AppError('Pull request is not open', 400);
  }
};

export const listPullRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const { status = 'all', repository, search } = req.query;

  const filter = {};
  if (status !== 'all') {
    filter.status = status;
  }

  if (repository) {
    const repo = await resolveRepository(repository);
    filter.repository = repo._id;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const [pullRequests, totalCount, open, closed, merged] = await Promise.all([
    populatePullRequest(PullRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    PullRequest.countDocuments(filter),
    PullRequest.countDocuments({ ...filter, status: 'open' }),
    PullRequest.countDocuments({ ...filter, status: 'closed' }),
    PullRequest.countDocuments({ ...filter, status: 'merged' }),
  ]);

  sendSuccess(res, 200, {
    pullRequests: pullRequests.map(serializePullRequest),
    counts: { open, closed, merged },
    pagination: buildPaginationMeta(page, limit, totalCount),
  }, 'Pull requests fetched successfully');
});

export const getPullRequest = asyncHandler(async (req, res) => {
  const pullRequest = await findPullRequest(req.params.id);
  sendSuccess(res, 200, serializePullRequest(pullRequest), 'Pull request fetched successfully');
});

export const createPullRequest = asyncHandler(async (req, res) => {
  const repository = await resolveRepository(req.body.repository, req.body.repositoryId);
  const sourceBranch = req.body.sourceBranch || req.body.fromBranch;
  const targetBranch = req.body.targetBranch || req.body.toBranch;

  const lastPullRequest = await PullRequest.findOne({ repository: repository._id })
    .sort({ number: -1 })
    .select('number');

  const pullRequest = await PullRequest.create({
    number: (lastPullRequest?.number || 0) + 1,
    title: req.body.title,
    description: req.body.description || '',
    repository: repository._id,
    author: req.user._id,
    sourceBranch,
    targetBranch,
    diff: req.body.diff || [],
  });

  const populated = await findPullRequest(pullRequest._id);
  sendSuccess(res, 201, serializePullRequest(populated), 'Pull request created successfully');
});

export const updatePullRequest = asyncHandler(async (req, res) => {
  const pullRequest = await findPullRequest(req.params.id);

  if (pullRequest.status === 'merged') {
    throw new AppError('Merged pull requests cannot be updated', 400);
  }

  const updates = ['title', 'description', 'sourceBranch', 'targetBranch', 'diff'];
  for (const key of updates) {
    if (req.body[key] !== undefined) {
      pullRequest[key] = req.body[key];
    }
  }

  if (req.body.fromBranch !== undefined) {
    pullRequest.sourceBranch = req.body.fromBranch;
  }

  if (req.body.toBranch !== undefined) {
    pullRequest.targetBranch = req.body.toBranch;
  }

  if (req.body.status !== undefined) {
    pullRequest.status = req.body.status;
    pullRequest.closedAt = req.body.status === 'closed' ? new Date() : null;
  }

  await pullRequest.save();

  const populated = await findPullRequest(pullRequest._id);
  sendSuccess(res, 200, serializePullRequest(populated), 'Pull request updated successfully');
});

export const mergePullRequest = asyncHandler(async (req, res) => {
  const pullRequest = await findPullRequest(req.params.id);
  ensureOpen(pullRequest);

  pullRequest.status = 'merged';
  pullRequest.mergedAt = new Date();
  pullRequest.closedAt = pullRequest.mergedAt;
  await pullRequest.save();

  const populated = await findPullRequest(pullRequest._id);
  sendSuccess(res, 200, serializePullRequest(populated), 'Pull request merged successfully');
});

export const closePullRequest = asyncHandler(async (req, res) => {
  const pullRequest = await findPullRequest(req.params.id);
  ensureOpen(pullRequest);

  pullRequest.status = 'closed';
  pullRequest.closedAt = new Date();
  await pullRequest.save();

  const populated = await findPullRequest(pullRequest._id);
  sendSuccess(res, 200, serializePullRequest(populated), 'Pull request closed successfully');
});

export const addPullRequestComment = asyncHandler(async (req, res) => {
  const pullRequest = await findPullRequest(req.params.id);

  pullRequest.comments.push({
    author: req.user._id,
    body: req.body.body,
    type: req.body.type || 'general',
  });

  await pullRequest.save();

  const comment = pullRequest.comments[pullRequest.comments.length - 1];
  await pullRequest.populate('comments.author', 'username avatarUrl');

  sendSuccess(res, 201, comment.toObject(), 'Pull request comment added successfully');
});

export const submitPullRequestReview = asyncHandler(async (req, res) => {
  const pullRequest = await findPullRequest(req.params.id);
  const statusMap = {
    approve: 'approved',
    changes_requested: 'changes_requested',
    comment: 'commented',
  };

  pullRequest.reviews.push({
    author: req.user._id,
    status: statusMap[req.body.action],
    comment: req.body.comment || '',
  });

  await pullRequest.save();

  const review = pullRequest.reviews[pullRequest.reviews.length - 1];
  await pullRequest.populate('reviews.author', 'username avatarUrl');

  sendSuccess(res, 201, review.toObject(), 'Pull request review submitted successfully');
});
