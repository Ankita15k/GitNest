import mongoose from 'mongoose';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';

/**
 * @desc    Get user profile by ID or username
 * @route   GET /api/v1/users/:username
 * @access  Public
 */
export const getUserProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;

  let user;

  // If the parameter is a valid Mongoose ObjectId, attempt to find by ID first
  if (mongoose.Types.ObjectId.isValid(username)) {
    user = await User.findById(username);
  }

  // Fallback to finding by username if not found by ID or if ID was invalid
  if (!user) {
    user = await User.findOne({ username });
  }

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  sendSuccess(res, 200, user, 'User profile fetched successfully');
});

/**
 * @desc    Update current user's profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { bio, location, website, avatarUrl } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update profile fields if provided in request body
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (website !== undefined) user.website = website;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  await user.save();

  sendSuccess(res, 200, user, 'Profile updated successfully');
});
