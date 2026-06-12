import path from 'path';
import fs from 'fs';
import simpleGit from 'simple-git';

import Repository from '../models/Repository.model.js';

import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';

export const pullRepository = asyncHandler(async (req, res, next) => {
  const { repoName, branch } = req.body;
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
  if (!fs.existsSync(repoPath)) {
    return next(new AppError('Repository directory not found', 404));
  }

  const git = simpleGit(repoPath);

  const result = await git.pull(
    'origin',
    branch || repository.defaultBranch
  );

  sendSuccess(
    res,
    200,
    result,
    'Repository pulled successfully'
  );
});