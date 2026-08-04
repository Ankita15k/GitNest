import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import User from '../models/User.model.js';
import Repository from '../models/Repository.model.js';
import SecurityEvent from '../models/SecurityEvent.model.js';
import SagaState from '../models/SagaState.model.js';
import { triggerRepositoryScan } from '../services/security.service.js';
import paginate, { buildPaginationMeta } from '../utils/paginate.js';

// Resolve a username to the owner document
const resolveOwner = async (username) => {
  const owner = await User.findOne({ username: username.toLowerCase() });
  return owner ? owner._id : null;
};

// Helper to find repository and verify owner authorization
const getAuthorizedRepository = async (username, reponame, userId, next) => {
  const ownerId = await resolveOwner(username);
  if (!ownerId) {
    return next(new AppError('Repository not found', 404));
  }

  const repository = await Repository.findOne({
    name: reponame,
    owner: ownerId,
  });

  if (!repository) {
    return next(new AppError('Repository not found', 404));
  }

  // Ensure user is the owner of the repository to access security scanning
  if (repository.owner.toString() !== userId) {
    return next(new AppError('Unauthorized access to security details', 403));
  }

  return repository;
};

/**
 * Trigger a new security scan for a repository.
 */
export const triggerScan = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;

  const repository = await getAuthorizedRepository(username, reponame, req.user.id, next);
  if (!repository) return;

  const { scanId } = await triggerRepositoryScan(repository.owner, repository._id, repository.name);

  sendSuccess(
    res,
    202,
    {
      scanId,
      status: 'processing',
      message: 'Security scan initiated successfully',
    },
    'Security scan initiated'
  );
});

/**
 * Get the status of a specific security scan.
 */
export const getScanStatus = asyncHandler(async (req, res, next) => {
  const { username, reponame, scanId } = req.params;

  const repository = await getAuthorizedRepository(username, reponame, req.user.id, next);
  if (!repository) return;

  const sagaState = await SagaState.findOne({ sagaId: scanId });
  if (!sagaState) {
    return next(new AppError('Scan job not found', 404));
  }

  const responseData = {
    scanId: sagaState.sagaId,
    status: sagaState.status,
    createdAt: sagaState.createdAt,
    updatedAt: sagaState.updatedAt,
  };

  if (sagaState.status === 'completed') {
    responseData.findingsSummary = {
      totalFindings: sagaState.metadata.totalFindings || 0,
      riskScore: sagaState.metadata.riskScore || 0,
    };
  } else if (sagaState.status === 'failed' || sagaState.status === 'rolled_back') {
    responseData.error = sagaState.failedStep
      ? `Failed during step: ${sagaState.failedStep}`
      : 'Scan job failed';
  }

  sendSuccess(res, 200, responseData, 'Security scan status retrieved');
});

/**
 * Retrieve security events / findings for a repository (paginated).
 */
export const getSecurityEvents = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;
  const { severity, type, scanId } = req.query;

  const repository = await getAuthorizedRepository(username, reponame, req.user.id, next);
  if (!repository) return;

  const { page, limit, skip } = paginate(req.query.page, req.query.limit);

  // Construct search query
  const query = { repository: repository._id };
  if (severity) query.severity = severity.toUpperCase();
  if (type) query.type = type.toUpperCase();
  if (scanId) query.scanId = scanId;

  const [events, totalCount] = await Promise.all([
    SecurityEvent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SecurityEvent.countDocuments(query),
  ]);

  const pagination = buildPaginationMeta(page, limit, totalCount);

  sendSuccess(
    res,
    200,
    {
      events,
      pagination,
    },
    'Security events retrieved successfully'
  );
});

.catch(err => console.error("Promise.all failed:", err));