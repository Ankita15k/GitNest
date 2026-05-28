import Repository from '../models/Repository.model.js';

import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';

import { getCommitHistory } from '../services/commitHistory.service.js';

export const fetchCommitHistory = asyncHandler(
  async (req, res, next) => {
    const { repoName } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const repository = await Repository.findOne({
      owner: req.user.id,
      name: repoName,
    });

    if (!repository) {
      return next(new AppError('Repository not found', 404));
    }

    const history = await getCommitHistory(
      req.user.id,
      repository.name,
      page,
      limit
    );

    sendSuccess(
      res,
      200,
      history,
      'Commit history fetched successfully!!!'
    );
  }
);
