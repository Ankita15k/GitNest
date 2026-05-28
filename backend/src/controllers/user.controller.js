import mongoose from 'mongoose';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import { logActivitySafely } from '../utils/logActivitySafely.js';
import ACTIVITY_TYPES from '../constants/activityTypes.js';
import paginate, { buildPaginationMeta } from '../utils/paginate.js';

export const getUserProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;

  const user = await User.findOne({ username: username.toLowerCase() });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  sendSuccess(res, 200, user, 'User profile fetched successfully');
});

// Follow a user with transaction-safe atomicity
export const followUser = asyncHandler(async (req, res, next) => {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) return next(new AppError('User not found', 404));
  if (target._id.equals(req.user._id)) return next(new AppError('You cannot follow yourself', 400));

  try {
    const targetResult = await User.updateOne(
      { _id: target._id, followers: { $ne: req.user._id } },
      { $addToSet: { followers: req.user._id } }
    );

    if (targetResult.matchedCount === 0) {
      return next(new AppError('User not found', 404));
    }
    if (targetResult.modifiedCount === 0) {
      return next(new AppError('Already following this user', 400));
    }

    const selfResult = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { following: target._id } },
      { session, new: true }
    );

    if (!selfResult) {
      await session.abortTransaction();
      return next(new AppError('User not found', 404));
    }

    await logActivitySafely({
      actor: req.user.id,
      type: ACTIVITY_TYPES.USER_FOLLOWED,
      targetUser: target._id,
      metadata: { targetUsername: target.username },
    });

    sendSuccess(res, 200, null, 'Followed successfully');
  } catch (error) {
    return next(new AppError('Follow operation failed', 500));
  }
});

// Unfollow a user with transaction-safe atomicity
export const unfollowUser = asyncHandler(async (req, res, next) => {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) return next(new AppError('User not found', 404));
  if (target._id.equals(req.user._id)) return next(new AppError('You cannot unfollow yourself', 400));

  try {
    const targetResult = await User.updateOne(
      { _id: target._id },
      { $pull: { followers: req.user._id } }
    );

    const selfResult = await User.updateOne(
      { _id: req.user._id },
      { $pull: { following: target._id } }
    );

    if (targetResult.matchedCount === 0 || selfResult.matchedCount === 0) {
      return next(new AppError('User not found', 404));
    }
    if (targetResult.modifiedCount === 0 && selfResult.modifiedCount === 0) {
      return next(new AppError('You were not following this user', 400));
    }

    await logActivitySafely({
      actor: req.user.id,
      type: ACTIVITY_TYPES.USER_UNFOLLOWED,
      targetUser: target._id,
      metadata: { targetUsername: target.username },
    });

    sendSuccess(res, 200, null, 'Unfollowed successfully');
  } catch (error) {
    return next(new AppError('Unfollow operation failed', 500));
  }
});

// Update current user's profile
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
    await logActivitySafely({
      actor: req.user.id,
      type: ACTIVITY_TYPES.PROFILE_UPDATED,
      targetUser: req.user.id,
      metadata: {
        changedFields,
      },
    });
  }

  sendSuccess(res, 200, user, 'Profile updated successfully');
});

// Get followers of a user
export const getFollowers = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });

  if (!user) return next(new AppError('User not found', 404));

  const { page, limit, skip } = paginate(req.query.page, req.query.limit);

  const [followers, totalCount] = await Promise.all([
    User.find({ _id: { $in: user.followers } })
      .select('username avatarUrl bio')
      .skip(skip)
      .limit(limit),
    User.countDocuments({ _id: { $in: user.followers } }),
  ]);

  const pagination = buildPaginationMeta(page, limit, totalCount);

  sendSuccess(res, 200, { followers, pagination }, 'Followers fetched successfully');
});

// Get following of a user
export const getFollowing = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });

  if (!user) return next(new AppError('User not found', 404));

  const { page, limit, skip } = paginate(req.query.page, req.query.limit);

  const [following, totalCount] = await Promise.all([
    User.find({ _id: { $in: user.following } })
      .select('username avatarUrl bio')
      .skip(skip)
      .limit(limit),
    User.countDocuments({ _id: { $in: user.following } }),
  ]);

  const pagination = buildPaginationMeta(page, limit, totalCount);

  sendSuccess(res, 200, { following, pagination }, 'Following fetched successfully');
});
