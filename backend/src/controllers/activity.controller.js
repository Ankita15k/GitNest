import asyncHandler from '../utils/asyncHandler.js';
import { getGlobalFeed, getRepositoryFeed, getUserFeed } from '../services/activity.service.js';
import { sendSuccess } from '../utils/responseHandlers.js';

export const getGlobalActivities = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const { activities, pagination } = await getGlobalFeed({ page, limit });
  sendSuccess(res, 200, {
    activities,
    pagination,
  }, 'Global activity feed retrieved successfully');
});

export const getUserActivities = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const { activities, pagination } = await getUserFeed({ username, page, limit });
  sendSuccess(res, 200, {
    activities,
    pagination,
  }, 'User activity feed retrieved successfully');
});

export const getRepositoryActivities = asyncHandler(async (req, res) => {
  const { repo } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const { activities, pagination } = await getRepositoryFeed({
    repo,
    page,
    limit,
    currentUser: req.user,
  });
  sendSuccess(res, 200, {
    activities,
    pagination,
  }, 'Repository activity feed retrieved successfully');
});
