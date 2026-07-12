import RepositoryCompliance from '../models/RepositoryCompliance.model.js';
import RepositoryHealth from '../models/RepositoryHealth.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import { resolveRepository } from './codeIntelligence.controller.js';
import { HealthScoring } from '../services/healthScoring.service.js';
import { PolicyEvaluation } from '../services/policyEvaluation.service.js';
import { ComplianceReport } from '../services/complianceReport.service.js';

const serialize = (value) => JSON.parse(JSON.stringify(value));

const resolveComplianceRepository = async (req) =>
  resolveRepository({
    username: req.params.username,
    reponame: req.params.reponame,
    userId: req.user.id,
  });

const latestHealthFor = async (repository) => {
  let health = await RepositoryHealth.findOne({ repositoryId: repository._id }).sort({ generatedAt: -1 }).lean();
  if (!health) {
    health = (await HealthScoring.generateAndPersist({
      repositoryId: repository._id,
      repositoryName: repository.name,
    })).toObject();
  }
  return health;
};

const latestComplianceFor = async (repository) => {
  let compliance = await RepositoryCompliance.findOne({ repositoryId: repository._id }).sort({ generatedAt: -1 }).lean();
  if (!compliance) {
    const health = await latestHealthFor(repository);
    compliance = (await PolicyEvaluation.evaluateAndPersist({
      repositoryId: repository._id,
      repositoryName: repository.name,
      health,
    })).toObject();
  }
  return serialize(compliance);
};

export const getRepositoryCompliance = asyncHandler(async (req, res) => {
  const { repository } = await resolveComplianceRepository(req);
  const compliance = await latestComplianceFor(repository);

  sendSuccess(res, 200, compliance, 'Repository compliance retrieved');
});

export const getRepositoryComplianceHistory = asyncHandler(async (req, res) => {
  const { repository } = await resolveComplianceRepository(req);
  const history = await RepositoryCompliance.find({ repositoryId: repository._id }).sort({ generatedAt: -1 }).limit(20).lean();

  sendSuccess(res, 200, { history: serialize(history) }, 'Repository compliance history retrieved');
});

export const getRepositoryComplianceViolations = asyncHandler(async (req, res) => {
  const { repository } = await resolveComplianceRepository(req);
  const compliance = await latestComplianceFor(repository);

  sendSuccess(res, 200, { violations: compliance.violations || [] }, 'Repository compliance violations retrieved');
});

export const getRepositoryComplianceReport = asyncHandler(async (req, res) => {
  const { repository } = await resolveComplianceRepository(req);
  const compliance = await latestComplianceFor(repository);

  sendSuccess(res, 200, ComplianceReport.generate(compliance), 'Repository compliance report retrieved');
});

export default {
  getRepositoryCompliance,
  getRepositoryComplianceHistory,
  getRepositoryComplianceViolations,
  getRepositoryComplianceReport,
};
