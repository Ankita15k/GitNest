import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import schemaValidator from '../middleware/schemaValidator.js';
import validate from '../middleware/validate.js';
import { contracts } from '../contracts/index.js';
import { repositoryHealthRepoValidator } from '../validators/repositoryHealth.validators.js';
import {
  getRepositoryHealth,
  getRepositoryHealthBreakdown,
  getRepositoryHealthHistory,
  getRepositoryHealthRecommendations,
} from '../controllers/repositoryHealth.controller.js';

const router = express.Router();

router.get(
  '/:username/:reponame/health',
  protect,
  ...schemaValidator(contracts.repositoryHealth.get),
  validate(repositoryHealthRepoValidator),
  getRepositoryHealth
);

router.get(
  '/:username/:reponame/health/history',
  protect,
  ...schemaValidator(contracts.repositoryHealth.history),
  validate(repositoryHealthRepoValidator),
  getRepositoryHealthHistory
);

router.get(
  '/:username/:reponame/health/breakdown',
  protect,
  ...schemaValidator(contracts.repositoryHealth.breakdown),
  validate(repositoryHealthRepoValidator),
  getRepositoryHealthBreakdown
);

router.get(
  '/:username/:reponame/health/recommendations',
  protect,
  ...schemaValidator(contracts.repositoryHealth.recommendations),
  validate(repositoryHealthRepoValidator),
  getRepositoryHealthRecommendations
);

export default router;
