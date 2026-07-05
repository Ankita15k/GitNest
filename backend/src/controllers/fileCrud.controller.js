import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';

import {
  createRepositoryFile,
  updateRepositoryFile,
  deleteRepositoryFile,
} from '../services/fileCrud.service.js';

const getRepositoryOwner = async (
  username,
  repoName
) => {
  const owner = await User.findOne({
    username: username.toLowerCase(),
  }).select('_id');

  if (!owner) {
    return null;
  }

  const repository = await Repository.findOne({
    owner: owner._id,
    name: repoName,
  });

  if (!repository) {
    return null;
  }

  return {
    owner,
    repository,
  };
};

export const createFile = asyncHandler(
  async (req, res, next) => {
    const { username, repoName } = req.params;
    const { path, content } = req.body;

    const result = await getRepositoryOwner(
      username,
      repoName
    );

    if (!result) {
      return next(
        new AppError('Repository not found', 404)
      );
    }

    const { owner } = result;

    if (
      req.user._id.toString() !==
      owner._id.toString()
    ) {
      return next(
        new AppError(
          'Not authorized',
          403
        )
      );
    }

    try {
      const file = await createRepositoryFile(
        owner._id.toString(),
        repoName,
        path,
        content
      );

      sendSuccess(
        res,
        201,
        file,
        'File created successfully'
      );
    } catch (error) {
      return next(
        new AppError(
          error.message,
          error.statusCode || 500
        )
      );
    }
  }
);

export const updateFile = asyncHandler(
  async (req, res, next) => {
    const { username, repoName } = req.params;
    const { path, content } = req.body;

    const result = await getRepositoryOwner(
      username,
      repoName
    );

    if (!result) {
      return next(
        new AppError('Repository not found', 404)
      );
    }

    const { owner } = result;

    if (
      req.user._id.toString() !==
      owner._id.toString()
    ) {
      return next(
        new AppError(
          'Not authorized',
          403
        )
      );
    }

    try {
      const file = await updateRepositoryFile(
        owner._id.toString(),
        repoName,
        path,
        content
      );

      sendSuccess(
        res,
        200,
        file,
        'File updated successfully'
      );
    } catch (error) {
      return next(
        new AppError(
          error.message,
          error.statusCode || 500
        )
      );
    }
  }
);

export const deleteFile = asyncHandler(
  async (req, res, next) => {
    const { username, repoName } = req.params;
    const { path } = req.body;

    const result = await getRepositoryOwner(
      username,
      repoName
    );

    if (!result) {
      return next(
        new AppError('Repository not found', 404)
      );
    }

    const { owner } = result;

    if (
      req.user._id.toString() !==
      owner._id.toString()
    ) {
      return next(
        new AppError(
          'Not authorized',
          403
        )
      );
    }

    try {
      const file = await deleteRepositoryFile(
        owner._id.toString(),
        repoName,
        path
      );

      sendSuccess(
        res,
        200,
        file,
        'File deleted successfully'
      );
    } catch (error) {
      return next(
        new AppError(
          error.message,
          error.statusCode || 500
        )
      );
    }
  }
);
