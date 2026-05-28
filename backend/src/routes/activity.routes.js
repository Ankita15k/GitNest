import express from 'express';
import {
  getGlobalActivities,
  getRepositoryActivities,
  getUserActivities,
} from '../controllers/activity.controller.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/global', ...schemaValidator(contracts.activities.global), getGlobalActivities);
router.get('/user/:username', ...schemaValidator(contracts.activities.user), getUserActivities);

router.get('/repository/:repo', protect, ...schemaValidator(contracts.activities.repository), getRepositoryActivities);

export default router;
