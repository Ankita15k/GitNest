import express from 'express';
import {
  getGlobalActivities,
  getRepositoryActivities,
  getUserActivities,
} from '../controllers/activity.controller.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';

const router = express.Router();

router.get('/global', ...schemaValidator(contracts.activities.global), getGlobalActivities);
router.get('/user/:username', ...schemaValidator(contracts.activities.user), getUserActivities);
router.get('/repository/:repo', ...schemaValidator(contracts.activities.repository), getRepositoryActivities);

export default router;
