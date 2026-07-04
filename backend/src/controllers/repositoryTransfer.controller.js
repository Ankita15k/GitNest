import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';
import RepositoryTransfer from '../models/RepositoryTransfer.model.js';
import Notification from '../models/Notification.model.js';
import { logAuditEvent } from '../utils/logAuditEvent.js';

export const initiateTransfer = asyncHandler(async (req, res, next) => {
  const { owner, repoName } = req.params;
  const { receiverUsername } = req.body;

  if (owner.toLowerCase() === receiverUsername.toLowerCase()) {
    return next(new AppError('Cannot transfer repository to yourself', 400));
  }

  const repoOwner = await User.findOne({ username: owner.toLowerCase() });
  if (!repoOwner) return next(new AppError('Repository owner not found', 404));

  const repository = await Repository.findOne({ owner: repoOwner._id, name: repoName });
  if (!repository) return next(new AppError('Repository not found', 404));

  // Must be owner to transfer
  if (repository.owner.toString() !== req.user._id.toString()) {
    return next(new AppError('Only the repository owner can initiate a transfer', 403));
  }

  const receiver = await User.findOne({ username: receiverUsername.toLowerCase() });
  if (!receiver) return next(new AppError('Receiver user not found', 404));

  // Check for duplicate pending requests for this repository
  const existingTransfer = await RepositoryTransfer.findOne({
    repository: repository._id,
    status: 'pending'
  });

  if (existingTransfer) {
    return next(new AppError('A pending transfer request already exists for this repository', 400));
  }

  const transfer = await RepositoryTransfer.create({
    repository: repository._id,
    sender: req.user._id,
    receiver: receiver._id,
  });

  // Log audit
  await logAuditEvent({
    userId: req.user._id,
    action: 'REPOSITORY_TRANSFER_INITIATED',
    details: { repositoryId: repository._id, receiverId: receiver._id }
  });

  // Notify receiver
  await Notification.create({
    user: receiver._id,
    title: 'Repository Transfer Request',
    message: `${req.user.username} wants to transfer ownership of ${repoName} to you.`,
    type: 'transfer_request',
    relatedData: { transferId: transfer._id, repoName }
  });

  sendSuccess(res, 201, transfer, 'Transfer request initiated successfully');
});

export const getPendingTransfers = asyncHandler(async (req, res, next) => {
  const incoming = await RepositoryTransfer.find({
    receiver: req.user._id,
    status: 'pending'
  }).populate('repository sender', 'name username');

  const outgoing = await RepositoryTransfer.find({
    sender: req.user._id,
    status: 'pending'
  }).populate('repository receiver', 'name username');

  sendSuccess(res, 200, { incoming, outgoing }, 'Pending transfers fetched successfully');
});

export const acceptTransfer = asyncHandler(async (req, res, next) => {
  const { owner, repoName } = req.params;

  const repoOwner = await User.findOne({ username: owner.toLowerCase() });
  if (!repoOwner) return next(new AppError('Repository owner not found', 404));

  const repository = await Repository.findOne({ owner: repoOwner._id, name: repoName });
  if (!repository) return next(new AppError('Repository not found', 404));

  const transfer = await RepositoryTransfer.findOne({
    repository: repository._id,
    receiver: req.user._id,
    status: 'pending'
  });

  if (!transfer) return next(new AppError('Pending transfer not found', 404));

  if (new Date() > transfer.expiresAt) {
    transfer.status = 'rejected';
    await transfer.save();
    return next(new AppError('Transfer request has expired', 400));
  }

  // Accept transfer
  transfer.status = 'accepted';
  await transfer.save();

  // Update repository ownership
  repository.owner = req.user._id;
  await repository.save();

  await logAuditEvent({
    userId: req.user._id,
    action: 'REPOSITORY_TRANSFER_ACCEPTED',
    details: { repositoryId: repository._id, previousOwner: repoOwner._id }
  });

  sendSuccess(res, 200, repository, 'Repository transfer accepted successfully');
});

export const rejectTransfer = asyncHandler(async (req, res, next) => {
  const { owner, repoName } = req.params;

  const repoOwner = await User.findOne({ username: owner.toLowerCase() });
  if (!repoOwner) return next(new AppError('Repository owner not found', 404));

  const repository = await Repository.findOne({ owner: repoOwner._id, name: repoName });
  if (!repository) return next(new AppError('Repository not found', 404));

  const transfer = await RepositoryTransfer.findOne({
    repository: repository._id,
    receiver: req.user._id,
    status: 'pending'
  });

  if (!transfer) return next(new AppError('Pending transfer not found', 404));

  transfer.status = 'rejected';
  await transfer.save();

  await logAuditEvent({
    userId: req.user._id,
    action: 'REPOSITORY_TRANSFER_REJECTED',
    details: { repositoryId: repository._id }
  });

  sendSuccess(res, 200, null, 'Repository transfer rejected successfully');
});

export const cancelTransfer = asyncHandler(async (req, res, next) => {
  const { owner, repoName } = req.params;

  const repoOwner = await User.findOne({ username: owner.toLowerCase() });
  if (!repoOwner) return next(new AppError('Repository owner not found', 404));

  const repository = await Repository.findOne({ owner: repoOwner._id, name: repoName });
  if (!repository) return next(new AppError('Repository not found', 404));

  const transfer = await RepositoryTransfer.findOne({
    repository: repository._id,
    sender: req.user._id,
    status: 'pending'
  });

  if (!transfer) return next(new AppError('Pending transfer not found', 404));

  transfer.status = 'cancelled';
  await transfer.save();

  await logAuditEvent({
    userId: req.user._id,
    action: 'REPOSITORY_TRANSFER_CANCELLED',
    details: { repositoryId: repository._id }
  });

  sendSuccess(res, 200, null, 'Repository transfer cancelled successfully');
});
