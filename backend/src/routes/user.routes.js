import express from 'express';
import { getUserProfile, updateProfile, followUser, unfollowUser } from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { updateProfileValidator, usernameParamValidator } from '../validators/user.validators.js';

const router = express.Router();

router.get('/:username', validate(usernameParamValidator), getUserProfile);
router.put('/profile', protect, validate(updateProfileValidator), updateProfile);
router.post('/:username/follow', protect, validate(usernameParamValidator), followUser);
router.delete('/:username/follow', protect, validate(usernameParamValidator), unfollowUser);

export default router;
