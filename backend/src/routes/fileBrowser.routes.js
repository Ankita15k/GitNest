import express from 'express';
import { getRepositoryTree, getRepositoryFile } from '../controllers/fileBrowser.controller.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import validate from '../middleware/validate.js';
import { fileBrowserValidator } from '../validators/fileBrowser.validators.js';

const router = express.Router();

router.get(
  '/:username/:repoName/tree',
  optionalAuth,
  validate(fileBrowserValidator),
  getRepositoryTree
);

router.get(
  '/:username/:repoName/files',
  optionalAuth,
  validate(fileBrowserValidator),
  getRepositoryFile
);

export default router;