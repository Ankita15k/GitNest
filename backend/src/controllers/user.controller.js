import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import paginate, { buildPaginationMeta } from '../utils/paginate.js';
import SagaOrchestrator from '../services/saga/sagaOrchestrator.js';
import eventEmitter from '../events/eventEmitter.js';
import { getRedisClient } from '../config/redis.js';
import { logActivity } from '../services/activity.service.js';
import ACTIVITY_TYPES from '../constants/activityTypes.js';

export const getUserProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;

  const cacheIdentifier =
    mongoose.Types.ObjectId.isValid(username)
      ? username
      : username.toLowerCase();

  const cacheKey = `user:profile:${cacheIdentifier}`;
  const redis = getRedisClient();

  if(redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return sendSuccess(res, 200, JSON.parse(cached), 'User profile fetched successfully');
    }
  }

  let user;

  if(mongoose.Types.ObjectId.isValid(username)) {
    user = await User.findById(username).lean();
  }

  if(!user) {
    user = await User.findOne({ username: username.toLowerCase() }).lean();
  }

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const userObj = {
    ...user,
    _id: user._id.toString(),
    createdAt: new Date(user.createdAt).toISOString(),
    updatedAt: new Date(user.updatedAt).toISOString(),
  };

  if (redis) {
    await redis.set(cacheKey, JSON.stringify(userObj), 'EX', 60);
  }

  sendSuccess(res, 200, userObj, 'User profile fetched successfully');
});

// Follow a user with transaction-safe atomicity
export const followUser = asyncHandler(async (req, res, next) => {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) return next(new AppError('User not found', 404));
  if (target._id.equals(req.user._id)) return next(new AppError('You cannot follow yourself', 400));

  const sagaId = req.headers['idempotency-key'] || uuidv4();
  const actorId = req.user._id.toString();
  const targetId = target._id.toString();

  const followSteps = [
    {
      name: 'updateTargetFollowers',
      execute: async (context, session) => {
        const result = await User.updateOne(
          { _id: context.targetId, followers: { $ne: context.actorId } },
          { $addToSet: { followers: context.actorId } },
          { session }
        );
        if (result.matchedCount === 0) {
          throw new AppError('User not found', 404);
        }
        if (result.modifiedCount === 0) {
          throw new AppError('Already following this user', 400);
        }
      },
      compensate: async (context, session) => {
        await User.updateOne(
          { _id: context.targetId },
          { $pull: { followers: context.actorId } },
          { session }
        );
      }
    },
    {
      name: 'updateActorFollowing',
      execute: async (context, session) => {
        const result = await User.updateOne(
          { _id: context.actorId, following: { $ne: context.targetId } },
          { $addToSet: { following: context.targetId } },
          { session }
        );
        if (result.matchedCount === 0) {
          throw new AppError('User not found', 404);
        }
      },
      compensate: async (context, session) => {
        await User.updateOne(
          { _id: context.actorId },
          { $pull: { following: context.targetId } },
          { session }
        );
      }
    }
  ];

  try {
    await SagaOrchestrator.executeSaga(
      sagaId,
      'FOLLOW_USER',
      followSteps,
      { actorId, targetId, targetUsername: target.username }
    );

    // Evict cached profiles for both users — follower/following counts are
    // included in the cached payload and are now stale for both sides.
    const redis = getRedisClient();
    if (redis) {
      await Promise.all([
        redis.del(`user:profile:${req.user.username}`),
        redis.del(`user:profile:${req.user._id.toString()}`),
        redis.del(`user:profile:${target.username}`),
        redis.del(`user:profile:${target._id.toString()}`),
      ]);
    }

    eventEmitter.emit('USER_FOLLOWED', {
      actorId,
      targetId,
      targetUsername: target.username,
    });

    sendSuccess(res, 200, null, 'Followed successfully');
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError(error.message || 'Follow operation failed', error.statusCode || 500));
  }
});

// Unfollow a user with transaction-safe atomicity
export const unfollowUser = asyncHandler(async (req, res, next) => {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) return next(new AppError('User not found', 404));
  if (target._id.equals(req.user._id)) return next(new AppError('You cannot unfollow yourself', 400));

  const sagaId = req.headers['idempotency-key'] || uuidv4();
  const actorId = req.user._id.toString();
  const targetId = target._id.toString();

  const unfollowSteps = [
    {
      name: 'updateTargetFollowers',
      execute: async (context, session) => {
        const result = await User.updateOne(
          { _id: context.targetId },
          { $pull: { followers: context.actorId } },
          { session }
        );
        if (result.matchedCount === 0) {
          throw new AppError('User not found', 404);
        }
        context.wasFollowing = result.modifiedCount > 0;
      },
      compensate: async (context, session) => {
        if (context.wasFollowing) {
          await User.updateOne(
            { _id: context.targetId, followers: { $ne: context.actorId } },
            { $addToSet: { followers: context.actorId } },
            { session }
          );
        }
      }
    },
    {
      name: 'updateActorFollowing',
      execute: async (context, session) => {
        const result = await User.updateOne(
          { _id: context.actorId },
          { $pull: { following: context.targetId } },
          { session }
        );
        if (result.matchedCount === 0) {
          throw new AppError('User not found', 404);
        }
        context.wasFollowed = result.modifiedCount > 0;
        if (!context.wasFollowing && !context.wasFollowed) {
          throw new AppError('You were not following this user', 400);
        }
      },
      compensate: async (context, session) => {
        if (context.wasFollowed) {
          await User.updateOne(
            { _id: context.actorId, following: { $ne: context.targetId } },
            { $addToSet: { following: context.targetId } },
            { session }
          );
        }
      }
    }
  ];

  try {
    await SagaOrchestrator.executeSaga(
      sagaId,
      'UNFOLLOW_USER',
      unfollowSteps,
      { actorId, targetId, targetUsername: target.username }
    );

    // Same as followUser — both sides carry stale counts after unfollow.
    const redis = getRedisClient();
    if (redis) {
      await Promise.all([
        redis.del(`user:profile:${req.user.username}`),
        redis.del(`user:profile:${req.user._id.toString()}`),
        redis.del(`user:profile:${target.username}`),
        redis.del(`user:profile:${target._id.toString()}`),
      ]);
    }

    eventEmitter.emit('USER_UNFOLLOWED', {
      actorId,
      targetId,
      targetUsername: target.username,
    });

    sendSuccess(res, 200, null, 'Unfollowed successfully');
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError(error.message || 'Unfollow operation failed', error.statusCode || 500));
  }
});

// Update current user's profile
export const updateProfile = asyncHandler(async (req, res, next) => {
  // Prevent Mass Assignment Privilege Escalation (Issue #427)
  delete req.body.role;
  delete req.body.isAdmin;
  delete req.body.permissions;

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

  const redis = getRedisClient();
  if (redis) {
    await Promise.all([
      redis.del(`user:profile:${user.username}`),
      redis.del(`user:profile:${user._id.toString()}`),
    ]);
  }

  if (changedFields.length > 0) {
    try {
      await logActivity({
        actor: req.user.id,
        type: ACTIVITY_TYPES.PROFILE_UPDATED,
        targetUser: req.user.id,
        metadata: { changedFields },
      });
    } catch {
      // Activity logging must never fail a profile update
    }
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
