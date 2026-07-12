import fs from 'fs';
import Repository from '../models/Repository.model.js';

import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';

import { cloneRepository } from '../services/clone.service.js';

export const cloneExternalRepository = asyncHandler(
  async (req, res, next) => {
    const { repositoryUrl } = req.body;

    if (!repositoryUrl) {
      return next(
        new AppError(
          'Repository URL is required',
          400
        )
      );
    }

    const repoName = repositoryUrl
      .split('/')
      .pop()
      .replace(/\.git$/i, '')
      .replace(/[^a-zA-Z0-9_-]/g, '');

    const existingRepository =
      await Repository.findOne({
        owner: req.user.id,
        name: repoName,
      });

    if (existingRepository) {
      return next(
        new AppError(
          'Repository already exists',
          400
        )
      );
    }

    let cloned;
    try {
      cloned = await cloneRepository(
        repositoryUrl,
        req.user.id,
        req.ip
      );
    } catch (err) {
      return next(new AppError(err.message, 400));
    }

    let repository;
    try {
      repository =
        await Repository.create({
          name: cloned.repoName,
          owner: req.user.id,
          visibility: 'public',
          sourceUrl: repositoryUrl,
        });
    } catch (err) {
      fs.rmSync(cloned.repoPath, { recursive: true, force: true });
      return next(
        new AppError('Failed to create repository record', 500)
      );
    }

    sendSuccess(
      res,
      201,
      repository,
      'Repository cloned successfully'
    );
  }
);
