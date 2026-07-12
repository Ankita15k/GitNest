import RepositoryHealth from '../models/RepositoryHealth.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import { resolveRepository } from './codeIntelligence.controller.js';
import { HealthScoring } from '../services/healthScoring.service.js';
import { RepositoryGovernance } from '../services/repositoryGovernance.service.js';

const serialize = (value) => JSON.parse(JSON.stringify(value));

const latestHealthFor = async (repository) => {
  let health = await RepositoryHealth.findOne({ repositoryId: repository._id }).sort({ generatedAt: -1 }).lean();

  if (!health) {
    health = (await HealthScoring.generateAndPersist({
      repositoryId: repository._id,
      repositoryName: repository.name,
    })).toObject();
  }

  return serialize(health);
};

const resolveHealthRepository = async (req) =>
  resolveRepository({
    username: req.params.username,
    reponame: req.params.reponame,
    userId: req.user.id,
  });

export const getRepositoryHealth = asyncHandler(async (req, res) => {
  const { repository } = await resolveHealthRepository(req);
  const health = await latestHealthFor(repository);

  sendSuccess(res, 200, { ...health, summary: RepositoryGovernance.summarize(health) }, 'Repository health retrieved');
});

export const getRepositoryHealthHistory = asyncHandler(async (req, res) => {
  const { repository } = await resolveHealthRepository(req);
  const history = await RepositoryHealth.find({ repositoryId: repository._id }).sort({ generatedAt: -1 }).limit(20).lean();

  sendSuccess(res, 200, { history: serialize(history) }, 'Repository health history retrieved');
});

export const getRepositoryHealthBreakdown = asyncHandler(async (req, res) => {
  const { repository } = await resolveHealthRepository(req);
  const health = await latestHealthFor(repository);

  sendSuccess(res, 200, RepositoryGovernance.breakdown(health), 'Repository health breakdown retrieved');
});

export const getRepositoryHealthRecommendations = asyncHandler(async (req, res) => {
  const { repository } = await resolveHealthRepository(req);
  const health = await latestHealthFor(repository);

  sendSuccess(
    res,
    200,
    { recommendations: RepositoryGovernance.recommendations(health) },
    'Repository health recommendations retrieved'
  );
});

export default {
  getRepositoryHealth,
  getRepositoryHealthHistory,
  getRepositoryHealthBreakdown,
  getRepositoryHealthRecommendations,
};
