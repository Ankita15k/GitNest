import express from 'express';
import {
  initializeRepository,
  addFiles,
  commitChanges,
  pushRepository,
  pullRepository,
  revertCommit,
  diffCommit,
  diffBranches,
  diffFile,
} from '../controllers/git.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { commitDiffValidator, branchDiffValidator, fileDiffValidator } from '../validators/git.validators.js';

const router = express.Router();

router.post('/:username/:reponame/init', protect, initializeRepository);
router.post('/:username/:reponame/add', protect, addFiles);
router.post('/:username/:reponame/commit', protect, commitChanges);
router.post('/:username/:reponame/push', protect, pushRepository);
router.post('/:username/:reponame/pull', protect, pullRepository);
router.post('/:username/:reponame/revert', protect, revertCommit);

router.get('/:username/:reponame/diff/commit/:commitHash', protect, validate(commitDiffValidator), diffCommit);
router.get('/:username/:reponame/diff/branches', protect, validate(branchDiffValidator), diffBranches);
router.get('/:username/:reponame/diff/file', protect, validate(fileDiffValidator), diffFile);

export default router;
