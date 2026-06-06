import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import { buildRepositoryTree, getRepositoryFileContent } from '../services/fileBrowser.service.js';

export const getRepositoryTree = asyncHandler(
  async (req, res, next) => {
    const { username, repoName } = req.params;

    const owner = await User.findOne({
      username: username.toLowerCase(),
    }).select('_id');

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
      (!req.user || req.user._id.toString() !== owner._id.toString())
    ) {
      return next(new AppError('Repository not found', 404));
    }

    const tree = await buildRepositoryTree(
      owner._id.toString(),
      repository.name
    );

    sendSuccess(
      res,
      200,
      tree,
      'Repository tree fetched successfully'
    );
  }
);

export const getRepositoryFile = asyncHandler(
  async (req, res, next) => {
    const { username, repoName } = req.params;
    const { path: filePath } = req.query;

    if (!filePath) {
      return next(new AppError('File path is required', 400));
    }

    const owner = await User.findOne({
      username: username.toLowerCase(),
    }).select('_id');

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
      (!req.user || req.user._id.toString() !== owner._id.toString())
    ) {
      return next(new AppError('Repository not found', 404));
    }

    try {
      const fileContent = await getRepositoryFileContent(
        owner._id.toString(),
        repository.name,
        filePath
      );

      sendSuccess(
        res,
        200,
        { content: fileContent },
        'File content fetched successfully'
      );
    } catch (error) {
      return next(new AppError(error.message, error.statusCode || 500));
    }
  }
);