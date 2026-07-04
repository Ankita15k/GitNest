import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { param, body } from 'express-validator';
import {
  initiateTransfer,
  getPendingTransfers,
  acceptTransfer,
  rejectTransfer,
  cancelTransfer
} from '../controllers/repositoryTransfer.controller.js';

const router = Router();

router.use(protect);

// Global route to get all pending transfers for the logged-in user
router.get('/pending', getPendingTransfers);

const repoParamsValidator = [
  param('owner')
    .trim()
    .notEmpty()
    .withMessage('Owner parameter is required')
    .isString()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Invalid owner format'),
  param('repoName')
    .trim()
    .notEmpty()
    .withMessage('RepoName parameter is required')
    .isString()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Invalid repoName format'),
];

router.post(
  '/:owner/:repoName/transfer',
  validate([
    ...repoParamsValidator,
    body('receiverUsername')
      .trim()
      .notEmpty()
      .withMessage('Receiver username is required')
      .isString(),
  ]),
  initiateTransfer
);

router.post(
  '/:owner/:repoName/transfer/accept',
  validate(repoParamsValidator),
  acceptTransfer
);

router.post(
  '/:owner/:repoName/transfer/reject',
  validate(repoParamsValidator),
  rejectTransfer
);

router.post(
  '/:owner/:repoName/transfer/cancel',
  validate(repoParamsValidator),
  cancelTransfer
);

export default router;
