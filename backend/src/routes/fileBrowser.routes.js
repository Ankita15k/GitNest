import express from 'express';

import { protect } from '../middleware/authMiddleware.js';

import {
  getRepositoryTree,
} from '../controllers/fileBrowser.controller.js';

const router = express.Router();

router.get(
  '/:repoName/tree',
  protect,
  getRepositoryTree
);

export default router;
