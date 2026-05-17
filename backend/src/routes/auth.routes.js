import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import gitPushWebhook from '../controllers/gitPush.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.post("/webhook/git-push", gitPushWebhook)
export default router;
