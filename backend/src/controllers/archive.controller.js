import fs from 'fs';

import User from '../models/User.model.js';
import Repository from '../models/Repository.model.js';

import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

import {
  generateRepositoryArchive,
} from '../services/archive.service.js';

export const downloadRepositoryArchive =
  asyncHandler(
    async (req, res, next) => {
      const { username, repoName } = req.params;

      const owner = await User.findOne({
        username: username.toLowerCase(),
      });

      if (!owner) {
        return next(
          new AppError(
            'Repository not found',
            404
          )
        );
      }

      const repository = await Repository.findOne({
        owner: owner._id,
        name: repoName,
      });

      if (!repository) {
        return next(
          new AppError(
            'Repository not found',
            404
          )
        );
      }

      if (
        repository.visibility === 'private' &&
        repository.owner.toString() !== req.user?.id
      ) {
        return next(
          new AppError(
            'Repository not found',
            404
          )
        );
      }

      const zipPath = await generateRepositoryArchive(
        repository.owner.toString(),
        repoName
      );

      res.download(
        zipPath,
        `${repoName}.zip`,
        () => {
          if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
          }
        }
      );
    }
  );
