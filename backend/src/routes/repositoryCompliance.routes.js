import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import schemaValidator from '../middleware/schemaValidator.js';
import validate from '../middleware/validate.js';
import { contracts } from '../contracts/index.js';
import { repositoryComplianceRepoValidator } from '../validators/repositoryCompliance.validators.js';
import {
  getRepositoryCompliance,
  getRepositoryComplianceHistory,
  getRepositoryComplianceReport,
  getRepositoryComplianceViolations,
} from '../controllers/repositoryCompliance.controller.js';

const router = express.Router();

router.get(
  '/:username/:reponame/compliance',
  protect,
  ...schemaValidator(contracts.repositoryCompliance.get),
  validate(repositoryComplianceRepoValidator),
  getRepositoryCompliance
);

router.get(
  '/:username/:reponame/compliance/history',
  protect,
  ...schemaValidator(contracts.repositoryCompliance.history),
  validate(repositoryComplianceRepoValidator),
  getRepositoryComplianceHistory
);

router.get(
  '/:username/:reponame/compliance/violations',
  protect,
  ...schemaValidator(contracts.repositoryCompliance.violations),
  validate(repositoryComplianceRepoValidator),
  getRepositoryComplianceViolations
);

router.get(
  '/:username/:reponame/compliance/report',
  protect,
  ...schemaValidator(contracts.repositoryCompliance.report),
  validate(repositoryComplianceRepoValidator),
  getRepositoryComplianceReport
);

export default router;
