import mongoose from 'mongoose';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import { logActivity } from '../services/activity.service.js';
import ACTIVITY_TYPES from '../constants/activityTypes.js';

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
    user = await User.findOne({ username: username.toLowerCase() });
  }

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  sendSuccess(res, 200, user, 'User profile fetched successfully');
});

/**
 * @desc    Follow a user
 * @route   POST /api/v1/users/:username/follow
 * @access  Private
 */
export const followUser = asyncHandler(async (req, res, next) => {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) return next(new AppError('User not found', 404));
  if (target._id.equals(req.user._id)) return next(new AppError('You cannot follow yourself', 400));

  const alreadyFollowing = target.followers.some((id) => id.equals(req.user._id));
  if (alreadyFollowing) return next(new AppError('Already following this user', 400));

  await User.findByIdAndUpdate(target._id, { $push: { followers: req.user._id } });
  await User.findByIdAndUpdate(req.user._id, { $push: { following: target._id } });

  sendSuccess(res, 200, null, 'Followed successfully');
});

/**
 * @desc    Unfollow a user
 * @route   DELETE /api/v1/users/:username/follow
 * @access  Private
 */
export const unfollowUser = asyncHandler(async (req, res, next) => {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) return next(new AppError('User not found', 404));
  if (target._id.equals(req.user._id)) return next(new AppError('You cannot unfollow yourself', 400));

  await User.findByIdAndUpdate(target._id, { $pull: { followers: req.user._id } });
  await User.findByIdAndUpdate(req.user._id, { $pull: { following: target._id } });

  sendSuccess(res, 200, null, 'Unfollowed successfully');
});

/**
 * @desc    Update current user's profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { bio, location, website, avatarUrl, displayName, company, twitterHandle } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update profile fields if provided in request body
  const changedFields = [];

  if (bio !== undefined && bio !== user.bio) {
    user.bio = bio;
    changedFields.push('bio');
  }

  if (location !== undefined && location !== user.location) {
    user.location = location;
    changedFields.push('location');
  }

  if (website !== undefined && website !== user.website) {
    user.website = website;
    changedFields.push('website');
  }

  if (avatarUrl !== undefined && avatarUrl !== user.avatarUrl) {
    user.avatarUrl = avatarUrl;
    changedFields.push('avatarUrl');
  }

  if (displayName !== undefined && displayName !== user.displayName) {
    user.displayName = displayName;
    changedFields.push('displayName');
  }

  if (company !== undefined && company !== user.company) {
    user.company = company;
    changedFields.push('company');
  }

  if (twitterHandle !== undefined && twitterHandle !== user.twitterHandle) {
    user.twitterHandle = twitterHandle;
    changedFields.push('twitterHandle');
  }

  await user.save();

  if (changedFields.length > 0) {
    try {
      await logActivity({
        actor: req.user.id,
        type: ACTIVITY_TYPES.PROFILE_UPDATED,
        targetUser: req.user.id,
        metadata: {
          changedFields,
        },
      });
    } catch {
      // Prevent activity logging failures from blocking profile updates
    }
  }

  sendSuccess(res, 200, user, 'Profile updated successfully');
});

