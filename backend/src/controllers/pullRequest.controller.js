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
import { acquireRepoLock } from '../utils/repoMutex.js';
import { compareBranches } from '../services/pullRequest.service.js';

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

/*
 * Returns a MongoDB $match expression that enforces repository visibility
 * at the aggregation level. Evaluated atomically alongside the PR query —
 * eliminates the TOCTOU window that existed in the two-query snapshot approach.
 *
 * @param {object|null} caller - req.user (may be undefined/null)
 * @param {mongoose.Types.ObjectId|null} pinnedRepoId - already-resolved repo _id, or null
 * @returns {object} Mongoose filter fragment for the repository field
 */

const buildVisibilityFilter = async (caller, pinnedRepoId) => {
  if (pinnedRepoId) {
    // Re-read visibility atomically at query time, not from a prior snapshot
    const repo = await Repository.findById(pinnedRepoId).select('visibility owner');
    if (!repo) return { repository: { $in: [] } }; // repo vanished — return nothing

    const isOwner = caller && repo.owner.toString() === caller._id.toString();
    if (repo.visibility === 'private' && !isOwner) {
      return { repository: { $in: [] } }; // caller cannot access this private repo
    }
    return { repository: pinnedRepoId }; // caller is allowed
  }

  if (!caller) {
    // Unauthenticated: only public repos
    const publicRepoIds = await Repository.find({ visibility: 'public' }).select('_id');
    return { repository: { $in: publicRepoIds.map((r) => r._id) } };
  }

  // Authenticated: public repos + caller's own private repos — single round-trip
  const visibleRepos = await Repository.find({
    $or: [{ visibility: 'public' }, { visibility: 'private', owner: caller._id }],
  }).select('_id');
  return { repository: { $in: visibleRepos.map((r) => r._id) } };
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
  if (search) filter.$text = { $search: search };

  let pinnedRepoId = null;
  if (repository) {
    const { username } = req.query;
    if (!mongoose.Types.ObjectId.isValid(repository) && !username) {
      throw new AppError('Repository name requires owner username to disambiguate', 400);
    }
    const pinnedRepo = await resolveRepository(repository, null, username);
    pinnedRepoId = pinnedRepo._id;
  }

  // Build a visibility filter that is evaluated atomically at query time,
  // eliminating the TOCTOU race between resolveVisibleRepoIds and PullRequest.find.
  const visibilityFilter = await buildVisibilityFilter(req.user || null, pinnedRepoId);

  // Short-circuit when no repos are accessible (e.g. non-owner querying a private repo)
  if (
    visibilityFilter.repository &&
    visibilityFilter.repository.$in &&
    visibilityFilter.repository.$in.length === 0
  ) {
    return sendSuccess(
      res,
      200,
      {
        pullRequests: [],
        counts: { open: 0, closed: 0, merged: 0 },
        pagination: buildPaginationMeta(page, limit, 0),
      },
      'Pull requests fetched successfully'
    );
  }

  Object.assign(filter, visibilityFilter);

  const [pullRequests, totalCount, open, closed, merged] = await Promise.all([
    populatePullRequest(PullRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    PullRequest.countDocuments(filter),
    PullRequest.countDocuments({ ...filter, status: 'open' }),
    PullRequest.countDocuments({ ...filter, status: 'closed' }),
    PullRequest.countDocuments({ ...filter, status: 'merged' }),
  ]);

  sendSuccess(
    res,
    200,
    {
      pullRequests: pullRequests.map(serializePullRequest),
      counts: { open, closed, merged },
      pagination: buildPaginationMeta(page, limit, totalCount),
    },
    'Pull requests fetched successfully'
  );
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

export const comparePullRequestBranches = asyncHandler(
  async (req, res, next) => {
    const {
      username,
      repoName,
      sourceBranch,
      targetBranch,
    } = req.query;

    if (
      !username ||
      !repoName ||
      !sourceBranch ||
      !targetBranch
    ) {
      return next(
        new AppError(
          'username, repoName, sourceBranch and targetBranch are required',
          400
        )
      );
    }

    const owner = await User.findOne({
      username: username.toLowerCase(),
    });

    if (!owner) {
      return next(new AppError('User not found', 404));
    }

    const repository = await Repository.findOne({
      owner: owner._id,
      name: repoName,
    });

    if (!repository) {
      return next(new AppError('Repository not found', 404));
    }

    if (
      repository.visibility === 'private' &&
      (!req.user ||
        req.user._id.toString() !== owner._id.toString())
    ) {
      return next(new AppError('Repository not found', 404));
    }

    const result = await compareBranches(
      owner._id.toString(),
      repository.name,
      sourceBranch,
      targetBranch
    );

    sendSuccess(res,200,result, 'Branches compared successfully');
  }
);

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

  const sagaId = req.headers['idempotency-key'] || uuidv4();
  const prId = pullRequest._id.toString();
  const actorId = req.user._id.toString();

  const sourceBranch = pullRequest.sourceBranch;
  const targetBranch = pullRequest.targetBranch;

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
        const [pr, repository] = await Promise.all([
          populatePullRequest(PullRequest.findById(context.prId)),
          Repository.findById(context.repository._id).select('name owner defaultBranch collaborators'),
        ]);
        if (!pr) throw new AppError('Pull request not found', 404);
        if (!repository) throw new AppError('Repository not found', 404);

        const { allowed, reasons } = await evaluateMerge({
          repository,
          pullRequest: pr,
          userId: context.actorId,
        });
        if (!allowed) {
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
        // Acquire the per-repository mutex before touching the working tree.
        // The lock is stored on the context so gitMerge and its compensate
        // can release it after the full checkout+merge critical section ends.
        context._repoLockRelease = await acquireRepoLock(context.repoPath);

        const git = simpleGit(context.repoPath);
        const status = await git.status();
        context._previousBranch = status.current;
        if (context._previousBranch !== context.targetBranch) {
          await git.checkout(context.targetBranch);
        }
      },
      compensate: async (context) => {
        try {
          if (context._previousBranch) {
            const git = simpleGit(context.repoPath);
            await git.checkout(context._previousBranch);
          }
        } finally {
          // Always release the lock, even if the compensating checkout fails.
          if (typeof context._repoLockRelease === 'function') {
            context._repoLockRelease();
            context._repoLockRelease = null;
          }
        }
      }
    },
    {
      name: 'gitMerge',
      execute: async (context) => {
        // Lock is already held from gitCheckout — no re-acquire needed.
        try {
          const git = simpleGit(context.repoPath);
          await git.merge([context.sourceBranch]);
        } finally {
          // Critical section ends after merge — release the lock.
          if (typeof context._repoLockRelease === 'function') {
            context._repoLockRelease();
            context._repoLockRelease = null;
          }
        }
      },
      compensate: async (context) => {
        const mergeHeadPath = path.join(context.repoPath, '.git', 'MERGE_HEAD');
        const mergeInProgress = fs.existsSync(mergeHeadPath);

        const git = simpleGit(context.repoPath);
        if (mergeInProgress) {
          await git.merge(['--abort']);
        } else {
          await git.checkout(['--', '.']);
        }
        // Lock was already released in gitMerge.execute's finally block.
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
