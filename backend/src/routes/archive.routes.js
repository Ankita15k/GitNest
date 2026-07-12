import express from 'express';

import { protect } from '../middleware/authMiddleware.js';

import {
  downloadRepositoryArchive,
} from '../controllers/archive.controller.js';

const router = express.Router();

router.get(
  '/:username/:repoName/archive',
  protect,
  downloadRepositoryArchive
);

export default router;
