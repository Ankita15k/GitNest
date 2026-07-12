import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
  createFile,
  updateFile,
  deleteFile,
} from '../controllers/fileCrud.controller.js';

const router = express.Router();

router.post(
  '/:username/:repoName/files',
  protect,
  createFile
);

router.put(
  '/:username/:repoName/files',
  protect,
  updateFile
);

router.delete(
  '/:username/:repoName/files',
  protect,
  deleteFile
);

export default router;

