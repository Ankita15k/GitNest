import Repository from '../models/Repository.model.js';

import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';

import { buildRepositoryTree } from '../services/fileBrowser.service.js';

export const getRepositoryTree = asyncHandler(
  async (req, res, next) => {
    const { repoName } = req.params;

    const repository = await Repository.findOne({
      owner: req.user.id,
      name: repoName,
    });

    if (!repository) {
      return next(new AppError('Repository not found', 404));
    }

    const tree = await buildRepositoryTree(
      req.user.id,
      repository.name
    );

    sendSuccess(
      res,
      200,
      tree,
      'Repository tree fetched successfully!!!'
    );
  }
);
