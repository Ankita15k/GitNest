import path from 'path';
import fs from 'fs';
import simpleGit from 'simple-git';

import Repository from '../models/Repository.model.js';

import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';

export const initializeRepository = asyncHandler(async (req, res, next) => {
  const { repoName } = req.body;
  if (!repoName) {
    return next(new AppError('Repository name is required', 400));
  }

  const repository = await Repository.findOne({
    owner: req.user.id,
    name: repoName,
  });
  if (!repository) {
    return next(new AppError('Repository not found', 404));
  }

  const repoPath = path.resolve(
    'repositories',
    req.user.id,
    repository.name
  );

  fs.mkdirSync(repoPath, { recursive: true });
  
  const git = simpleGit(repoPath);
  const alreadyInitialized = fs.existsSync(
    path.join(repoPath, '.git')
  );
  if (alreadyInitialized) {
    return next(new AppError('Repository already initialized', 400));
  }

  await git.init();
  sendSuccess(
    res,
    201,
    repository,
    'Repository initialized successfully'
  );
});
