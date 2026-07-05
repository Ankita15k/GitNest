import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import {
  getBranches,
  createBranch,
  checkoutBranch,
  deleteBranch,
  renameBranch,
} from '../services/branch.service.js';

// Helper — finds repo by username and repoName
const getRepositoryByUsername = async (username, repoName) => {
  const owner = await User.findOne({
    username: username.toLowerCase(),
  }).select('_id');

  if (!owner) return null;

  const repository = await Repository.findOne({
    owner: owner._id,
    name: repoName,
  });

  return { repository, ownerId: owner._id };
};

export const fetchBranches = asyncHandler(
  async (req, res, next) => {
    const { username, repoName } = req.params;

    const result = await getRepositoryByUsername(username, repoName);

    if (!result || !result.repository) {
      return next(new AppError('Repository not found', 404));
    }

    const { repository, ownerId } = result;

    // Block private repos for non-owners
    if (
      repository.visibility === 'private' &&
      (!req.user || req.user._id.toString() !== ownerId.toString())
    ) {
      return next(new AppError('Repository not found', 404));
    }

    const branchData = await getBranches(
      ownerId.toString(),
      repository.name
    );

    sendSuccess(res, 200, branchData, 'Branches fetched successfully');
  }
);

export const createRepositoryBranch = asyncHandler(
  async (req, res, next) => {
    const { username, repoName } = req.params;
    const { branchName } = req.body;

    if (!branchName) {
      return next(new AppError('Branch name is required', 400));
    }

    const result = await getRepositoryByUsername(username, repoName);

    if (!result || !result.repository) {
      return next(new AppError('Repository not found', 404));
    }

    const { repository, ownerId } = result;

    // Only owner can create branches
    if (req.user._id.toString() !== ownerId.toString()) {
      return next(
        new AppError(
          'Not authorized to create branches in this repository',
          403
        )
      );
    }

    try {
      await createBranch(
        ownerId.toString(),
        repository.name,
        branchName
      );
    } catch (error) {
      return next(new AppError(error.message, 400));
    }

    sendSuccess(res, 201, null, 'Branch created successfully');
  }
);

export const checkoutRepositoryBranch = asyncHandler(
  async (req, res, next) => {
    const { username, repoName } = req.params;
    const { branchName } = req.body;

    if (!branchName) {
      return next(new AppError('Branch name is required', 400));
    }

    const result = await getRepositoryByUsername(username, repoName);

    if (!result || !result.repository) {
      return next(new AppError('Repository not found', 404));
    }

    const { repository, ownerId } = result;

    // Only owner can checkout branches
    if (req.user._id.toString() !== ownerId.toString()) {
      return next(
        new AppError(
          'Not authorized to checkout branches in this repository',
          403
        )
      );
    }

    try {
      await checkoutBranch(
        ownerId.toString(),
        repository.name,
        branchName
      );
    } catch (error) {
      return next(new AppError(error.message, 400));
    }

    sendSuccess(res, 200, null, 'Branch checked out successfully');
  }
);

export const renameRepositoryBranch = asyncHandler(
  async (req, res, next) => {
    const { username, repoName } = req.params;
    const { oldBranchName, newBranchName } = req.body;

    if (!oldBranchName || !newBranchName) {
      return next(
        new AppError(
          'Old and new branch names are required',
          400
        )
      );
    }

    const result = await getRepositoryByUsername(
      username,
      repoName
    );

    if (!result || !result.repository) {
      return next(new AppError('Repository not found', 404));
    }

    const { repository, ownerId } = result;

    // Only owner can rename branches
    if (req.user._id.toString() !== ownerId.toString()) {
      return next(
        new AppError(
          'Not authorized to rename branches in this repository',
          403
        )
      );
    }

    try {
      const renamed = await renameBranch(
        ownerId.toString(),
        repository.name,
        oldBranchName,
        newBranchName
      );

      sendSuccess(
        res,
        200,
        renamed,
        'Branch renamed successfully'
      );
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  }
);

export const deleteRepositoryBranch = asyncHandler(
  async (req, res, next) => {
    const { username, repoName, branchName } = req.params;

    const result = await getRepositoryByUsername(username, repoName);

    if (!result || !result.repository) {
      return next(new AppError('Repository not found', 404));
    }

    const { repository, ownerId } = result;

    // Only owner can delete branches
    if (req.user._id.toString() !== ownerId.toString()) {
      return next(
        new AppError(
          'Not authorized to delete branches in this repository',
          403
        )
      );
    }

    try {
      await deleteBranch(
        ownerId.toString(),
        repository.name,
        branchName
      );
    } catch (error) {
      return next(new AppError(error.message, 400));
    }

    sendSuccess(res, 200, null, 'Branch deleted successfully');
  }
);
