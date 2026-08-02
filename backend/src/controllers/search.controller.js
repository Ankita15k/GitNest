import User from '../models/User.model.js';
import Repository from '../models/Repository.model.js';
import PullRequest from '../models/PullRequest.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendPaginated } from '../utils/responseHandlers.js';
import paginate, { buildPaginationMeta } from '../utils/paginate.js';
import { sanitizeSearchQuery } from '../utils/sanitizeSearchQuery.js';
import { searchFiles, searchCommits} from '../services/search.service.js';

const SEARCH_TYPES = {
  USERS: 'users',
  REPOSITORIES: 'repositories',
  PULL_REQUESTS: 'pullRequests',
  FILES: 'files',
  COMMITS: 'commits',
  ALL: 'all',
};

const visibleRepoIds = async (userId) => {
  const repos = await Repository.find(
    userId
      ? { $or: [{ visibility: 'public' }, { owner: userId }] }
      : { visibility: 'public' },
  ).select('_id').lean();
  return repos.map(r => r._id);
};

const performSearch = async (query, type, skip, limit, userId) => {
  // Sanitize the query to prevent NoSQL injection via regex operators
  const sanitizedQuery = sanitizeSearchQuery(query);
  const searchFilter = { $text: { $search: sanitizedQuery } };
  const projections = {
    users: { username: 1, displayName: 1, avatarUrl: 1, bio: 1, _id: 1, createdAt: 1 },
    repositories: { name: 1, owner: 1, description: 1, language: 1, stars: 1, topics: 1, visibility: 1, _id: 1, createdAt: 1 },
    pullRequests: { title: 1, description: 1, status: 1, author: 1, repository: 1, number: 1, _id: 1, createdAt: 1 },
  };

  const queries = [];

  if (type === SEARCH_TYPES.ALL || type === SEARCH_TYPES.USERS) {
    queries.push(
      Promise.all([
        User.find(searchFilter)
          .select(projections.users)
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(searchFilter)
      ]).then(([docs, count]) => ({
      .catch(err => console.error(err))