import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { mergeBranchesValidator } from '../validators/merge.validators.js';
import { mergeRepositoryBranches } from '../controllers/merge.controller.js';

const router = express.Router();

router.post(
  '/:username/:repoName/merge',
  protect,
  validate(mergeBranchesValidator),
  mergeRepositoryBranches
);

export default router;
