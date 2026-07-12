import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import { mergeBranches } from '../services/merge.service.js';

const getRepositoryByUsername = async (
  username,
  repoName
) => {
  const owner = await User.findOne({
    username: username.toLowerCase(),
  }).select('_id');

  if (!owner) return null;

  const repository = await Repository.findOne({
    owner: owner._id,
    name: repoName,
  });

  return {
    repository,
    ownerId: owner._id,
  };
};

export const mergeRepositoryBranches = asyncHandler(
  async (req, res, next) => {
    const { username, repoName } = req.params;
    const { sourceBranch, targetBranch } = req.body;

    const result = await getRepositoryByUsername(
      username,
      repoName
    );

    if (!result || !result.repository) {
      return next(
        new AppError('Repository not found', 404)
      );
    }

    const { repository, ownerId } = result;

    if (
      req.user._id.toString() !==
      ownerId.toString()
    ) {
      return next(
        new AppError(
          'Not authorized to merge branches in this repository',
          403
        )
      );
    }

    let mergeResult;

    try {
      mergeResult = await mergeBranches(
        ownerId.toString(),
        repository.name,
        sourceBranch,
        targetBranch
      );
    } catch (error) {
      return next(
        new AppError(error.message, 400)
      );
    }

    if (mergeResult.hasConflicts) {
      return sendSuccess(
        res,
        409,
        {
          hasConflicts: true,
          conflicts: mergeResult.conflicts,
        },
        'Merge conflicts detected'
      );
    }

    sendSuccess(
      res,
      200,
      mergeResult,
      'Branches merged successfully'
    );
  }
);
