import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import validate from '../middleware/validate.js';
import {
  fetchBranchesValidator,
  createBranchValidator,
  checkoutBranchValidator,
  renameBranchValidator,
  deleteBranchValidator,
} from '../validators/branch.validators.js';
import {
  fetchBranches,
  createRepositoryBranch,
  checkoutRepositoryBranch,
  renameRepositoryBranch,
  deleteRepositoryBranch,
} from '../controllers/branch.controller.js';

const router = express.Router();

// Public read — anyone can list branches of a public repo
router.get(
  '/:username/:repoName/branches',
  optionalAuth,
  validate(fetchBranchesValidator),
  fetchBranches
);

// Protected write — only owner can create branches
router.post(
  '/:username/:repoName/branches',
  protect,
  validate(createBranchValidator),
  createRepositoryBranch
);

// Protected write — only owner can checkout branches
router.post(
  '/:username/:repoName/branches/checkout',
  protect,
  validate(checkoutBranchValidator),
  checkoutRepositoryBranch
);

// Protected write — only owner can rename branches
router.patch(
  '/:username/:repoName/branches/rename',
  protect,
  validate(renameBranchValidator),
  renameRepositoryBranch
);

// Protected write — only owner can delete branches
router.delete(
  '/:username/:repoName/branches/:branchName',
  protect,
  validate(deleteBranchValidator),
  deleteRepositoryBranch
);

export default router;
