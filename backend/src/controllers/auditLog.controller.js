import mongoose from 'mongoose';
import Repository from '../models/Repository.model.js';
import AuditLog from '../models/AuditLog.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import paginate, { buildPaginationMeta } from '../utils/paginate.js';

const resolveOwner = async (username) => {
  const owner = await User.findOne({ username: username.toLowerCase() });
  return owner ? { _id: owner._id } : null;
};

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { username, reponame } = req.params;
  const { page, limit, startDate, endDate, actionType, actorId } = req.query;

  const owner = await resolveOwner(username);
  if (!owner) {
    throw new AppError('Repository not found', 404);
  }

  const repository = await Repository.findOne({
    name: reponame,
    owner: owner._id,
  });

  if (!repository) {
    throw new AppError('Repository not found', 404);
  }

   if (repository.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to view audit logs for this repository', 403);
  }

  const filter = {
    repositoryId: repository._id,
  };

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }

  if (actionType) {
    filter.actionType = actionType;
  }

  if (actorId) {
    filter.actorId = mongoose.Types.ObjectId.isValid(actorId)
      ? new mongoose.Types.ObjectId(actorId)
      : actorId;
  }

  const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);

  const [logs, totalCount] = await Promise.all([
    AuditLog.find(filter)
      .populate('actorId', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    AuditLog.countDocuments(filter),
  ]);

  const pagination = buildPaginationMeta(pageNum, limitNum, totalCount);

  sendSuccess(res, 200, { logs, pagination }, 'Audit logs fetched successfully');
});
