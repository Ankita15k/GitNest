import path from 'path';
import fs from 'fs';
import simpleGit from 'simple-git';

import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';

import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';

const resolveOwner = async (username) => {
  const owner = await User.findOne({ username: username.toLowerCase() });
  return owner ? { _id: owner._id } : null;
};

const getRepositoryContext = async (
  username,
  reponame,
  userId,
  next,
  { requireGit = true } = {}
) => {
  const owner = await resolveOwner(username);

  if (!owner || owner._id.toString() !== userId) {
    next(new AppError('Repository not found or unauthorized', 404));
    return null;
  }

  const repository = await Repository.findOne({
    name: reponame,
    owner: owner._id,
  });

  if (!repository) {
    next(new AppError('Repository not found', 404));
    return null;
  }

  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    userId,
    repository.name
  );

  if (!fs.existsSync(repoPath)) {
    fs.mkdirSync(repoPath, { recursive: true });
  }

  if (requireGit && !fs.existsSync(path.join(repoPath, '.git'))) {
    next(new AppError('Invalid Git repository', 400));
    return null;
  }

  return {
    repository,
    repoPath,
    git: simpleGit(repoPath),
  };
};

export const initializeRepository = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;

  const context = await getRepositoryContext(
    username,
    reponame,
    req.user.id,
    next,
    { requireGit: false }
  );

  if (!context) return;

  const { repository, repoPath, git } = context;

  if (fs.existsSync(path.join(repoPath, '.git'))) {
    return next(new AppError('Repository already initialized', 400));
  }

  await git.init();

  sendSuccess(res, 201, repository, 'Repository initialized successfully');
});;

export const addFiles = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { files = ['.'] } = req.body;

  const context = await getRepositoryContext(
    username,
    reponame,
    req.user.id,
    next
  );

  if (!context) return;

  const { repository, git } = context;

  await git.add(files);

  sendSuccess(
    res,
    200,
    {
      repository: repository.name,
      files,
    },
    'Files staged successfully'
  );
});

export const commitChanges = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { message } = req.body;

  if (!message) {
    return next(new AppError('Commit message is required', 400));
  }

  const context = await getRepositoryContext(
    username,
    reponame,
    req.user.id,
    next
  );

  if (!context) return;

  const { git } = context;

  const commit = await git.commit(message);

  sendSuccess(res, 200, commit, 'Commit created successfully');
});;

export const pushRepository = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { branch } = req.body;

  const context = await getRepositoryContext(
    username,
    reponame,
    req.user.id,
    next
  );

  if (!context) return;

  const { repository, git } = context;

  const result = await git.push(
    'origin',
    branch || repository.defaultBranch
  );

  sendSuccess(res, 200, result, 'Repository pushed successfully');
});

export const pullRepository = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { branch } = req.body;

  const context = await getRepositoryContext(
    username,
    reponame,
    req.user.id,
    next
  );

  if (!context) return;

  const { repository, git } = context;

  const result = await git.pull(
    'origin',
    branch || repository.defaultBranch
  );

  sendSuccess(res, 200, result, 'Repository pulled successfully');
});

export const revertCommit = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { commitHash } = req.body;

  if (!commitHash) {
    return next(new AppError('Commit hash is required', 400));
  }

  const context = await getRepositoryContext(
    username,
    reponame,
    req.user.id,
    next
  );

  if (!context) return;

  const { git } = context;

  try {
    await git.revert(commitHash);
  } catch {
    return next(new AppError('Invalid commit hash', 400));
  }

  sendSuccess(
    res,
    200,
    { commitHash },
    'Commit reverted successfully'
  );
});

export const diffCommit = asyncHandler(async (req, res, next) => {
  const { username, reponame, commitHash } = req.params;

  const context = await getRepositoryContext(
    username,
    reponame,
    req.user.id,
    next
  );

  if (!context) return;

  const { git } = context;

  let diff;

  try {
    diff = await git.show([commitHash]);
  } catch {
    return next(new AppError('Invalid commit hash', 400));
  }

  sendSuccess(
    res,
    200,
    {
      commitHash,
      diff,
    },
    'Commit diff fetched successfully'
  );
});

export const diffBranches = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { base, compare } = req.query;

  const context = await getRepositoryContext(
    username,
    reponame,
    req.user.id,
    next
  );

  if (!context) return;

  const { git } = context;

  let diff;

  try {
    diff = await git.diff([`${base}...${compare}`]);
  } catch {
    return next(new AppError('Invalid branch comparison', 400));
  }

  sendSuccess(
    res,
    200,
    {
      base,
      compare,
      diff,
    },
    'Branch diff fetched successfully'
  );
});

export const diffFile = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { base, compare, file } = req.query;

  const context = await getRepositoryContext(
    username,
    reponame,
    req.user.id,
    next
  );

  if (!context) return;

  const { git } = context;

  let diff;

  try {
    diff = await git.diff([
      `${base}..${compare}`,
      '--',
      file,
    ]);
  } catch {
    return next(new AppError('Unable to generate file diff', 400));
  }

  sendSuccess(
    res,
    200,
    {
      file,
      base,
      compare,
      diff,
    },
    'File diff fetched successfully'
  );
});
