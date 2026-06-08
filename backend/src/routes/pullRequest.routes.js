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
import { protect, optionalProtect, requirePullRequestAccess } from '../middleware/authMiddleware.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';

const router = express.Router();

// optionalProtect lets the handler know who is calling so visibility filtering
// can include the authenticated user's private-repo PRs when a token is present
router.get('/', optionalProtect, ...schemaValidator(contracts.pullRequests.list), listPullRequests);
router.get('/:id', optionalProtect, ...schemaValidator(contracts.pullRequests.detail), getPullRequest);
router.post('/', protect, ...schemaValidator(contracts.pullRequests.create), createPullRequest);

// PR author or repo owner may update or close
router.put('/:id', protect, requirePullRequestAccess('author'), ...schemaValidator(contracts.pullRequests.update), updatePullRequest);
router.post('/:id/close', protect, requirePullRequestAccess('author'), ...schemaValidator(contracts.pullRequests.close), closePullRequest);

// Only the repo owner may merge
router.post('/:id/merge', protect, requirePullRequestAccess('repoOwner'), ...schemaValidator(contracts.pullRequests.merge), mergePullRequest);

// Collaborators, PR author, and repo owner may comment or review
router.post('/:id/comments', protect, requirePullRequestAccess('repoCollaborator'), ...schemaValidator(contracts.pullRequests.comment), addPullRequestComment);
router.post('/:id/reviews', protect, requirePullRequestAccess('repoCollaborator'), ...schemaValidator(contracts.pullRequests.review), submitPullRequestReview);

export default router;
