import fs from 'fs';
import path from 'path';

import Repository from '../models/Repository.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import { cloneRepository } from '../services/clone.service.js';

/**
 * Removes a cloned directory from disk if it exists.
 * Called when the DB write fails after a successful git clone so no
 * orphaned directories are left behind.
 */
const cleanupCloneDir = (repoPath) => {
  try {
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
    }
  } catch {
    // Best-effort cleanup — log but do not rethrow
    console.error(`[clone] Failed to remove orphaned directory: ${repoPath}`);
  }
};

export const cloneExternalRepository = asyncHandler(
  async (req, res, next) => {
    const { repositoryUrl } = req.body;

    if (!repositoryUrl) {
      return next(new AppError('Repository URL is required', 400));
    }

    // Derive the repo name from the URL first (no I/O) so we can check for
    // duplicates in MongoDB BEFORE touching the filesystem.
    const derivedName = repositoryUrl
      .split('/')
      .pop()
      .replace(/\.git$/i, '');

    // ── Duplicate check BEFORE any disk write (fixes TOCTOU) ──────────────
    const existingRepository = await Repository.findOne({
      owner: req.user.id,
      name: derivedName,
    });

    if (existingRepository) {
      return next(new AppError('Repository already exists', 400));
    }

    // ── Clone to disk (SSRF guard runs inside cloneRepository) ────────────
    let repoName, repoPath;
    try {
      ({ repoName, repoPath } = await cloneRepository(
        repositoryUrl,
        req.user.id
      ));
    } catch (err) {
      return next(new AppError(err.message || 'Clone failed', 400));
    }

    // ── Persist to MongoDB ─────────────────────────────────────────────────
    // The { owner, name } unique index is a final safety net for the narrow
    // race window between the findOne above and this create call.
    let repository;
    try {
      repository = await Repository.create({
        name: repoName,
        owner: req.user.id,
        visibility: 'public',
        sourceUrl: repositoryUrl,
      });
    } catch (err) {
      // E11000 = duplicate key — concurrent request won the race
      if (err.code === 11000) {
        cleanupCloneDir(repoPath);
        return next(new AppError('Repository already exists', 400));
      }
      cleanupCloneDir(repoPath);
      return next(new AppError('Failed to save repository', 500));
    }

    sendSuccess(res, 201, repository, 'Repository cloned successfully');
  }
);