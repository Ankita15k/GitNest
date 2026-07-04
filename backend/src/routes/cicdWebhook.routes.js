import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  handleGitHubWebhook,
  handleGenericWebhook,
  getCIStatus,
} from '../controllers/cicdWebhook.controller.js';

const router = express.Router();

router.post('/github', handleGitHubWebhook);

router.post('/generic', handleGenericWebhook);

router.get('/status/:commitSha', protect, getCIStatus);

export default router;
