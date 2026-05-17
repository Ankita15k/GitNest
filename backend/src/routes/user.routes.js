import express from 'express';
import { getUserProfile, updateProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to view any user's profile
router.get('/:username', getUserProfile);

// Protected route to update current user's profile
router.put('/profile', protect, updateProfile);

export default router;
