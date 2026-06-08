import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';
import PullRequest from '../models/PullRequest.model.js';
import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import paginate, { buildPaginationMeta } from '../utils/paginate.js';
import { v4 as uuidv4 } from 'uuid';
import SagaOrchestrator from '../services/saga/sagaOrchestrator.js';
import eventEmitter from '../events/eventEmitter.js';
import { evaluateMerge } from '../services/branchProtectionEvaluator.service.js';

const populatePullRequest = (query) =>
  query.populate('author', 'username avatarUrl').populate('repository', 'name owner defaultBranch').populate('comments.author', 'username avatarUrl').populate('reviews.author', 'username avatarUrl');

const serializePullRequest = (pullRequest) => {
  const raw = typeof pullRequest.toObject === 'function' ? pullRequest.toObject({ virtuals: true }) : pullRequest;
  return { ...raw, id: String(raw._id), fromBranch: raw.fromBranch || raw.sourceBranch, toBranch: raw.toBranch || raw.targetBranch };
};

const resolveRepository = async (repositoryRef, repositoryId, username) => {
  const ref = repositoryId || repositoryRef;
  if (!ref) throw new AppError('Repository is required', 400);
  if (mongoose.Types.ObjectId.isValid(ref)) {
    const byId = await Repository.findById(ref);
    if (byId) return byId;
  }
  const query = { name: ref };
  if (username) {
    const owner = await User.findOne({ username: username.toLowerCase() });
    if (!owner) throw new AppError('Repository not found', 404);
    query.owner = owner._id;
  }
  const repository = await Repository.findOne(query);
  if (!repository) throw new AppError('Repository not found', 404);
  return repository;
};

const findPullRequest = async (id) => {
  const query = mongoose.Types.ObjectId.isValid(id) ? PullRequest.findById(id) : PullRequest.findOne({ number: Number(id) });
  const pullRequest = await populatePullRequest(query);
  if (!pullRequest) throw new AppError('Pull request not found', 404);
  return pullRequest;
};

/**
 * Resolves the set of repository IDs the calling user is allowed to see.
 *
 * Unauthenticated callers may only see public repositories.
 * Authenticated callers may see public repositories plus any private
 * repository they own.
 *
 * When the caller has already narrowed the query to a specific repository,
 * we still enforce this check — if the resolved repository is private and the
 * caller is not the owner, we return an empty set so the query yields nothing
 * rather than leaking data.
 *
 * @param {object|null} caller  - req.user (may be undefined/null)
 * @param {object|null} pinnedRepo - a specific Repository document when the
 *   request includes a ?repository= filter, or null otherwise
 * @returns {mongoose.Types.ObjectId[]|null} array of allowed repo IDs, or
 *   null to indicate "no restriction needed" (caller owns the pinned repo)
 */
const resolveVisibleRepoIds = async (caller, pinnedRepo) => {
  if (pinnedRepo) {
    const isOwner = caller && pinnedRepo.owner.toString() === caller._id.toString();
    if (pinnedRepo.visibility === 'private' && !isOwner) {
      // Return an empty array — the pinned private repo is not accessible
      return [];
    }
    // Caller owns the private repo, or it's public — no additional restriction
    return null;
  }

  // No pinned repo — build the full set of visible repo IDs
  if (!caller) {
    const publicRepos = await Repository.find({ visibility: 'public' }).select('_id');
    return publicRepos.map((r) => r._id);
  }

  const [publicRepos, ownedPrivateRepos] = await Promise.all([
    Repository.find({ visibility: 'public' }).select('_id'),
    Repository.find({ visibility: 'private', owner: caller._id }).select('_id'),
  ]);
  return [...publicRepos, ...ownedPrivateRepos].map((r) => r._id);
};
const resolveMergeRepository = async (pullRequest) => {
  const repositoryId = pullRequest.repository?._id || pullRequest.repository;
  const repository = await Repository.findById(repositoryId).select('name owner defaultBranch');
  if (!repository) throw new AppError('Repository not found', 404);
  return repository;
};

const isMergeConflictError = (error) => {
  const message = `${error?.message || ''} ${error?.stderr || ''}`.toLowerCase();
  return message.includes('conflict') || message.includes('conflicts');
};

export const listPullRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const { status = 'all', repository, search } = req.query;
  const filter = {};
  if (status !== 'all') filter.status = status;

  let pinnedRepo = null;
  if (repository) {
    const { username } = req.query;
    if (!mongoose.Types.ObjectId.isValid(repository) && !username) {
      throw new AppError('Repository name requires owner username to disambiguate', 400);
    }
    pinnedRepo = await resolveRepository(repository, null, username);
    filter.repository = pinnedRepo._id;
  }

  if (search) filter.$text = { $search: search };

  // Restrict results to repositories the caller is permitted to read
  const visibleRepoIds = await resolveVisibleRepoIds(req.user || null, pinnedRepo);
  if (visibleRepoIds !== null) {
    if (visibleRepoIds.length === 0) {
      // Caller has no access to any visible repository
      return sendSuccess(res, 200, {
        pullRequests: [],
        counts: { open: 0, closed: 0, merged: 0 },
        pagination: buildPaginationMeta(page, limit, 0),
      }, 'Pull requests fetched successfully');
    }
    // Intersect with any pinned-repo filter already set
    filter.repository = filter.repository
      ? filter.repository
      : { $in: visibleRepoIds };
    if (!repository) {
      filter.repository = { $in: visibleRepoIds };
    }
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

  // Enforce visibility — private-repo PRs are only accessible to the repo owner
  const repo = await Repository.findById(pullRequest.repository._id).select('owner visibility');
  if (repo && repo.visibility === 'private') {
    const callerId = req.user ? req.user._id.toString() : null;
    if (callerId !== repo.owner.toString()) {
      throw new AppError('Pull request not found', 404);
    }
  }

  sendSuccess(res, 200, serializePullRequest(pullRequest), 'Pull request fetched successfully');
});

export const createPullRequest = asyncHandler(async (req, res) => {
  const repository = await resolveRepository(req.body.repository, req.body.repositoryId, req.body.username);

  // Atomically increment the PR counter on the repository document.
  // findOneAndUpdate with $inc is a single atomic MongoDB operation — concurrent
  // requests can never observe the same counter value, eliminating the TOCTOU
  // race that caused E11000 duplicate key errors on the {repository, number} index.
  const updatedRepo = await Repository.findByIdAndUpdate(
    repository._id,
    { $inc: { prCount: 1 } },
    { new: true, select: 'prCount' }
  );

  if (!updatedRepo) throw new AppError('Repository not found', 404);

  const pullRequest = await PullRequest.create({
    number: updatedRepo.prCount,
    title: req.body.title,
    description: req.body.description || '',
    repository: repository._id,
    author: req.user._id,
    sourceBranch: req.body.sourceBranch || req.body.fromBranch,
    targetBranch: req.body.targetBranch || req.body.toBranch,
    diff: req.body.diff || [],
  });

  sendSuccess(res, 201, serializePullRequest(await findPullRequest(pullRequest._id)), 'Pull request created successfully');
});

export const updatePullRequest = asyncHandler(async (req, res) => {
  // req.pullRequest is pre-fetched and authorization-checked by requirePullRequestAccess
  const pullRequest = req.pullRequest || await findPullRequest(req.params.id);
  if (pullRequest.status === 'merged') throw new AppError('Merged pull requests cannot be updated', 400);
  const { status: _ignoredStatus, ...safeBody } = req.body;
  for (const key of ['title', 'description', 'sourceBranch', 'targetBranch', 'diff']) {
    if (safeBody[key] !== undefined) pullRequest[key] = safeBody[key];
  }
  if (safeBody.fromBranch !== undefined) pullRequest.sourceBranch = safeBody.fromBranch;
  if (safeBody.toBranch !== undefined) pullRequest.targetBranch = safeBody.toBranch;
  await pullRequest.save();
  sendSuccess(res, 200, serializePullRequest(await findPullRequest(pullRequest._id)), 'Pull request updated successfully');
});

export const mergePullRequest = asyncHandler(async (req, res, next) => {
  const pullRequest = await findPullRequest(req.params.id);
  if (pullRequest.status !== 'open') throw new AppError('Pull request is not open', 400);

  const repository = await resolveMergeRepository(pullRequest);
  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    repository.owner.toString(),
    repository.name,
  );

  if (!fs.existsSync(repoPath)) {
    throw new AppError('Repository directory not found on disk', 500);
  }

  // Evaluate branch protection rules before allowing the merge
  const evalResult = await evaluateMerge({
    repository,
    pullRequest,
    userId: req.user._id,
  });

  if (!evalResult.allowed) {
    throw new AppError(
      `Merge blocked by branch protection rules: ${evalResult.reasons.join(' ')}`,
      403
    );
  }

  const sagaId = req.headers['idempotency-key'] || uuidv4();
  const prId = pullRequest._id.toString();
  const actorId = req.user._id.toString();

  const mergeSteps = [
    {
      name: 'validateOpen',
      execute: async (context, session) => {
        const pr = await PullRequest.findById(context.prId).session(session);
        if (!pr) throw new AppError('Pull request not found', 404);
        if (pr.status !== 'open') {
          throw new AppError('Pull request is not open', 400);
        }
      },
      compensate: null
    },
    {
      name: 'checkBranchProtection',
      execute: async (context) => {
        const pr = await populatePullRequest(PullRequest.findById(context.prId));
        if (!pr) throw new AppError('Pull request not found', 404);
        const { allowed, isOwnerOverride, reasons } = await evaluateMerge({
          repository: context.repository,
          pullRequest: pr,
          userId: context.actorId,
        });
        if (!allowed && !isOwnerOverride) {
          throw new AppError(reasons.join(' '), 403);
        }
      },
      compensate: null
    },
    {
      name: 'updatePRStatus',
      execute: async (context, session) => {
        const mergedAt = new Date();
        const result = await PullRequest.updateOne(
          { _id: context.prId, status: 'open' },
          { status: 'merged', mergedAt, closedAt: mergedAt },
          { session }
        );
        if (result.matchedCount === 0) {
          throw new AppError('Pull request is not open', 400);
        }
        context.mergedAt = mergedAt;
      },
      compensate: async (context, session) => {
        await PullRequest.updateOne(
          { _id: context.prId },
          { status: 'open', mergedAt: null, closedAt: null },
          { session }
        );
      }
    },
    {
      name: 'gitCheckout',
      execute: async (context) => {
        const git = simpleGit(context.repoPath);
        const status = await git.status();
        context._previousBranch = status.current;
        if (context._previousBranch !== context.targetBranch) {
          await git.checkout(context.targetBranch);
        }
      },
      compensate: async (context) => {
        if (context._previousBranch) {
          const git = simpleGit(context.repoPath);
          await git.checkout(context._previousBranch);
        }
      }
    },
    {
      name: 'gitMerge',
      execute: async (context) => {
        const git = simpleGit(context.repoPath);
        await git.merge([context.sourceBranch]);
      },
      compensate: async (context) => {
        const git = simpleGit(context.repoPath);
        const status = await git.status();
        if (status.conflicts && status.conflicts.length > 0) {
          await git.merge(['--abort']);
        } else {
          await git.reset(['--merge', 'HEAD~1']);
        }
      }
    }
  ];

  try {
    await SagaOrchestrator.executeSaga(
      sagaId,
      'MERGE_PULL_REQUEST',
      mergeSteps,
      { prId, repoPath, targetBranch, sourceBranch, actorId, repository }
    );

    const git = simpleGit(repoPath);
    const remoteExists = await git.branch(['--list', sourceBranch]);

    if (remoteExists && remoteExists.all?.includes(sourceBranch)) {
      try {
        await git.branch(['-d', sourceBranch]);
      } catch {
        // Ignore delete failure — branch may have unmerged work
      }
    }

    eventEmitter.emit('PULL_REQUEST_MERGED', {
      actorId: req.user._id.toString(),
      repoId: pullRequest.repository._id.toString(),
      prNumber: pullRequest.number,
      prTitle: pullRequest.title,
    });

    const updated = await findPullRequest(pullRequest._id);
    sendSuccess(res, 200, serializePullRequest(updated), 'Pull request merged successfully');
  } catch (error) {
    if (error instanceof AppError) return next(error);
    return next(new AppError(error.message || 'Merge operation failed', 500));
  }
});

export const closePullRequest = asyncHandler(async (req, res) => {
  // req.pullRequest is pre-fetched and authorization-checked by requirePullRequestAccess('author')
  const pullRequest = req.pullRequest || await findPullRequest(req.params.id);
  if (pullRequest.status !== 'open') throw new AppError('Pull request is not open', 400);
  pullRequest.status = 'closed';
  pullRequest.closedAt = new Date();
  await pullRequest.save();
  sendSuccess(res, 200, serializePullRequest(await findPullRequest(pullRequest._id)), 'Pull request closed successfully');
});

export const addPullRequestComment = asyncHandler(async (req, res) => {
  // req.pullRequest is pre-fetched and authorization-checked by requirePullRequestAccess('readMember')
  const pullRequest = req.pullRequest || await findPullRequest(req.params.id);
  pullRequest.comments.push({ author: req.user._id, body: req.body.body, type: req.body.type || 'general' });
  await pullRequest.save();
  const comment = pullRequest.comments[pullRequest.comments.length - 1];
  await pullRequest.populate('comments.author', 'username avatarUrl');
  sendSuccess(res, 201, comment.toObject(), 'Pull request comment added successfully');
});

export const submitPullRequestReview = asyncHandler(async (req, res) => {
  // req.pullRequest is pre-fetched and authorization-checked by requirePullRequestAccess('readMember')
  const pullRequest = req.pullRequest || await findPullRequest(req.params.id);
  const statusMap = { approve: 'approved', changes_requested: 'changes_requested', comment: 'commented' };
  pullRequest.reviews.push({ author: req.user._id, status: statusMap[req.body.action], comment: req.body.comment || '' });
  await pullRequest.save();
  const review = pullRequest.reviews[pullRequest.reviews.length - 1];
  await pullRequest.populate('reviews.author', 'username avatarUrl');
  sendSuccess(res, 201, review.toObject(), 'Pull request review submitted successfully');
});
