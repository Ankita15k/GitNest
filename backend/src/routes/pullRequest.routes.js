import express from 'express';
import {
  addPullRequestComment,
  closePullRequest,
  createPullRequest,
  getPullRequest,
  listPullRequests,
  mergePullRequest,
  submitPullRequestReview,
  updatePullRequest,
} from '../controllers/pullRequest.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';

const router = express.Router();

router.get('/', ...schemaValidator(contracts.pullRequests.list), listPullRequests);
router.get('/:id', ...schemaValidator(contracts.pullRequests.detail), getPullRequest);
router.post('/', protect, ...schemaValidator(contracts.pullRequests.create), createPullRequest);
router.put('/:id', protect, ...schemaValidator(contracts.pullRequests.update), updatePullRequest);
router.post('/:id/merge', protect, ...schemaValidator(contracts.pullRequests.merge), mergePullRequest);
router.post('/:id/close', protect, ...schemaValidator(contracts.pullRequests.close), closePullRequest);
router.post('/:id/comments', protect, ...schemaValidator(contracts.pullRequests.comment), addPullRequestComment);
router.post('/:id/reviews', protect, ...schemaValidator(contracts.pullRequests.review), submitPullRequestReview);

export default router;
