import express from 'express';
import {
    getUserProfile,
    updateProfile,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
} from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { updateProfileValidator, usernameParamValidator } from '../validators/user.validators.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';

const router = express.Router();

// Public routes
router.get('/:username', ...schemaValidator(contracts.users.profile), validate(usernameParamValidator), getUserProfile);
router.get('/:username/followers', ...schemaValidator(contracts.users.followers), validate(usernameParamValidator), getFollowers);
router.get('/:username/following', ...schemaValidator(contracts.users.following), validate(usernameParamValidator), getFollowing);

// Protected routes
router.put('/profile', protect, ...schemaValidator(contracts.users.updateProfile), validate(updateProfileValidator), updateProfile);
router.post('/:username/follow', protect, ...schemaValidator(contracts.users.follow), validate(usernameParamValidator), followUser);
router.delete('/:username/follow', protect, ...schemaValidator(contracts.users.unfollow), validate(usernameParamValidator), unfollowUser);

export default router;