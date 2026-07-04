import path from 'path';
import fs from 'fs';
import simpleGit from 'simple-git';

import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';

import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import { evaluateDirectAction } from '../services/branchProtectionEvaluator.service.js';

const resolveOwner = async (username) => {
  const owner = await User.findOne({ username: username.toLowerCase() });
  return owner ? { _id: owner._id } : null;
};

export const initializeRepository = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;

  const owner = await resolveOwner(username);
  if (!owner || owner._id.toString() !== req.user.id) {
    return next(new AppError('Repository not found or unauthorized', 404));
  }

  const repository = await Repository.findOne({
    name: reponame,
    owner: owner._id,
  });
  if (!repository) {
    return next(new AppError('Repository not found', 404));
  }

  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    req.user.id,
    repository.name
  );

  fs.mkdirSync(repoPath, { recursive: true });

  if (fs.existsSync(path.join(repoPath, '.git'))) {
    return next(new AppError('Repository already initialized', 400));
  }

  const git = simpleGit(repoPath);
  await git.init();

  sendSuccess(res, 201, repository, 'Repository initialized successfully');
});

export const addFiles = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { files = ['.'] } = req.body;

  const owner = await resolveOwner(username);
  if (!owner || owner._id.toString() !== req.user.id) {
    return next(new AppError('Repository not found or unauthorized', 404));
  }

  const repository = await Repository.findOne({
    name: reponame,
    owner: owner._id,
  });
  if (!repository) {
    return next(new AppError('Repository not found', 404));
  }

  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    req.user.id,
    repository.name
  );
  if (!fs.existsSync(repoPath)) {
    return next(new AppError('Repository directory not found', 404));
  }
  if (!fs.existsSync(path.join(repoPath, '.git'))) {
    return next(new AppError('Invalid Git repository', 400));
  }

  const git = simpleGit(repoPath);
  await git.add(files);

  sendSuccess(res, 200, { repository: repository.name, files }, 'Files staged successfully');
});

export const commitChanges = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { message } = req.body;

  if (!message) {
    return next(new AppError('Commit message is required', 400));
  }

  const owner = await resolveOwner(username);
  if (!owner || owner._id.toString() !== req.user.id) {
    return next(new AppError('Repository not found or unauthorized', 404));
  }

  const repository = await Repository.findOne({
    name: reponame,
    owner: owner._id,
  });
  if (!repository) {
    return next(new AppError('Repository not found', 404));
  }

  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    req.user.id,
    repository.name
  );
  if (!fs.existsSync(repoPath)) {
    return next(new AppError('Repository directory not found', 404));
  }

  const git = simpleGit(repoPath);
  const status = await git.status();
  const currentBranch = status.current;

  const evaluation = await evaluateDirectAction({
    repository,
    branchName: currentBranch,
    userId: req.user._id,
    action: 'commit'
  });

  if (!evaluation.allowed) {
    return next(new AppError(evaluation.reasons.join(' '), 403));
  }

  const commit = await git.commit(message);

  sendSuccess(res, 200, commit, 'Commit created successfully');
});

export const pushRepository = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { branch } = req.body;

  const owner = await resolveOwner(username);
  if (!owner || owner._id.toString() !== req.user.id) {
    return next(new AppError('Repository not found or unauthorized', 404));
  }

  const repository = await Repository.findOne({
    name: reponame,
    owner: owner._id,
  });
  if (!repository) {
    return next(new AppError('Repository not found', 404));
  }

  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    req.user.id,
    repository.name
  );
  if (!fs.existsSync(repoPath)) {
    return next(new AppError('Repository directory not found', 404));
  }

  const targetBranch = branch || repository.defaultBranch;

  const evaluation = await evaluateDirectAction({
    repository,
    branchName: targetBranch,
    userId: req.user._id,
    action: 'push'
  });

  if (!evaluation.allowed) {
    return next(new AppError(evaluation.reasons.join(' '), 403));
  }

  const git = simpleGit(repoPath);
  const result = await git.push('origin', targetBranch);

  sendSuccess(res, 200, result, 'Repository pushed successfully');
});

export const pullRepository = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { branch } = req.body;

  const owner = await resolveOwner(username);
  if (!owner || owner._id.toString() !== req.user.id) {
    return next(new AppError('Repository not found or unauthorized', 404));
  }

  const repository = await Repository.findOne({
    name: reponame,
    owner: owner._id,
  });
  if (!repository) {
    return next(new AppError('Repository not found', 404));
  }

  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    req.user.id,
    repository.name
  );
  if (!fs.existsSync(repoPath)) {
    return next(new AppError('Repository directory not found', 404));
  }

  const git = simpleGit(repoPath);
  const result = await git.pull('origin', branch || repository.defaultBranch);

  sendSuccess(res, 200, result, 'Repository pulled successfully');
});

export const revertCommit = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { commitHash } = req.body;

  if (!commitHash) {
    return next(new AppError('Commit hash is required', 400));
  }

  const owner = await resolveOwner(username);
  if (!owner || owner._id.toString() !== req.user.id) {
    return next(new AppError('Repository not found or unauthorized', 404));
  }

  const repository = await Repository.findOne({
    name: reponame,
    owner: owner._id,
  });
  if (!repository) {
    return next(new AppError('Repository not found', 404));
  }

  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    req.user.id,
    repository.name
  );
  if (!fs.existsSync(repoPath)) {
    return next(new AppError('Repository directory not found', 404));
  }

  const git = simpleGit(repoPath);
  await git.revert(commitHash);

  sendSuccess(res, 200, { commitHash }, 'Commit reverted successfully');
});
