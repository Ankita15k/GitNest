import mongoose from 'mongoose';
import Activity from '../models/Activity.model.js';
import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import paginate from '../utils/paginate.js';

const safeActivityQuery = (query) =>
  query
    .populate('actor', 'username avatarUrl')
    .populate('repository', 'name');

const buildActivityPage = async (filter, page, limit) => {
  const pagination = paginate(page, limit);
  const [activities, totalItems] = await Promise.all([
    safeActivityQuery(
      Activity.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit)
    ).lean(),
    Activity.countDocuments(filter),
  ]);

  return {
    activities,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.max(1, Math.ceil(totalItems / pagination.limit)),
      totalItems,
    },
  };
};

export const logActivity = async (activityPayload) => {
  if (activityPayload.repository) {
    const repo = await Repository.findById(activityPayload.repository).select('visibility');
    if (repo && repo.visibility === 'private') {
      activityPayload.visibility = 'private';
    }
  }
  return Activity.create(activityPayload);
};

export const getGlobalFeed = async ({ page, limit } = {}) => {
  return buildActivityPage({ visibility: 'public' }, page, limit);
};

export const getUserFeed = async ({ username, page, limit } = {}) => {
  if (!username) {
    throw new AppError('Username parameter is required', 400);
  }

  const user = await User.findOne({ username: username.toLowerCase() });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return buildActivityPage({ actor: user._id }, page, limit);
};

export const getRepositoryFeed = async ({ repo, page, limit, currentUser } = {}) => {
  if (!repo) {
    throw new AppError('Repository parameter is required', 400);
  }

  let repository = null;

  if (mongoose.Types.ObjectId.isValid(repo)) {
    repository = await Repository.findById(repo);
  } else {
    // Backwards-compatible string lookup is restricted to public repos only.
    // This prevents cross-tenant/private repo leaks when multiple repos share a name.
    const matches = await Repository.find({ name: repo, visibility: 'public' })
      .select('_id visibility owner')
      .limit(2);

    if (matches.length > 1) {
      throw new AppError('Repository lookup is ambiguous. Use repository id.', 400);
    }

    repository = matches[0] || null;
  }

  if (!repository) {
    throw new AppError('Repository not found', 404);
  }

  if (
    repository.visibility === 'private' &&
    (!currentUser || repository.owner.toString() !== currentUser.id)
  ) {
    throw new AppError('Repository not found', 404);
  }

  return buildActivityPage({ repository: repository._id }, page, limit);
};
