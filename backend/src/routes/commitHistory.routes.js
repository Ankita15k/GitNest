import express from 'express';

import { protect } from '../middleware/authMiddleware.js';

import {
  fetchCommitHistory,
} from '../controllers/commitHistory.controller.js';

const router = express.Router();

router.get(
  '/:repoName/commits',
  protect,
  fetchCommitHistory
);

export default router;
