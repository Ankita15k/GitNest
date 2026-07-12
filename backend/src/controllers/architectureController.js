import ArchitectureAnalysis from '../models/ArchitectureAnalysis.model.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import { resolveRepository } from './codeIntelligence.controller.js';
import { ArchitectureMapping } from '../services/architectureMapping.service.js';

const serialize = (value) => JSON.parse(JSON.stringify(value));

const latestAnalysisFor = async (repository) => {
  let analysis = await ArchitectureAnalysis.findOne({ repositoryId: repository._id }).sort({ generatedAt: -1 }).lean();

  if (!analysis) {
    analysis = (await ArchitectureMapping.generateAndPersist({
      repositoryId: repository._id,
      repositoryName: repository.name,
    })).toObject();
  }

  return serialize(analysis);
};

const resolveArchitectureRepository = async (req) => {
  const username = req.params.username || req.params.owner;
  const reponame = req.params.reponame || req.params.repo;

  return resolveRepository({
    username,
    reponame,
    userId: req.user.id,
  });
};

export const getArchitecture = asyncHandler(async (req, res) => {
  const { repository } = await resolveArchitectureRepository(req);
  const analysis = await latestAnalysisFor(repository);

  sendSuccess(res, 200, analysis, 'Architecture analysis retrieved');
});

export const getHotspots = asyncHandler(async (req, res) => {
  const { repository } = await resolveArchitectureRepository(req);
  const analysis = await latestAnalysisFor(repository);

  sendSuccess(res, 200, { hotspots: analysis.metrics?.hotspots || [] }, 'Architecture hotspots retrieved');
});

export const getRisk = asyncHandler(async (req, res) => {
  const { repository } = await resolveArchitectureRepository(req);
  const analysis = await latestAnalysisFor(repository);

  sendSuccess(
    res,
    200,
    {
      riskScore: analysis.riskScore,
      complexityScore: analysis.complexityScore,
      circularDependencyCount: analysis.circularDependencyCount,
      criticalModuleCount: analysis.criticalModuleCount,
    },
    'Architecture risk retrieved'
  );
});

export const getModule = asyncHandler(async (req, res, next) => {
  const { repository } = await resolveArchitectureRepository(req);
  const moduleName = decodeURIComponent(req.params.moduleName);
  const analysis = await latestAnalysisFor(repository);
  const module = (analysis.metrics?.modules || []).find((item) => item.moduleName === moduleName);

  if (!module) return next(new AppError('Module not found', 404));

  sendSuccess(
    res,
    200,
    {
      module,
      relationships: (analysis.metrics?.relationships || []).filter(
        (edge) => edge.source === moduleName || edge.target === moduleName
      ),
      hotspots: (analysis.metrics?.hotspots || []).filter((hotspot) => hotspot.moduleName === moduleName),
    },
    'Architecture module retrieved'
  );
});

export const getLegacyArchitecture = asyncHandler(async (req, res) => {
  const { repository } = await resolveArchitectureRepository(req);
  const analysis = await latestAnalysisFor(repository);
  const modules = analysis.metrics?.modules || [];
  const relationships = analysis.metrics?.relationships || [];

  sendSuccess(
    res,
    200,
    {
      graph: {
        nodes: modules.map((module) => ({
          id: module.moduleName,
          name: module.moduleName.split('/').pop(),
          type: 'file',
          importCount: module.dependencyCount,
          importedByCount: module.dependentCount,
        })),
        edges: relationships.map((edge) => ({ source: edge.source, target: edge.target })),
      },
      hotspots: (analysis.metrics?.hotspots || []).map((hotspot) => ({
        id: hotspot.moduleName,
        name: hotspot.moduleName.split('/').pop(),
        connections: hotspot.referenceCount,
      })),
      circularDeps: analysis.metrics?.circularDependencies || [],
      stats: {
        totalFiles: modules.length,
        totalEdges: analysis.metrics?.dependencyCount || 0,
        languages: {},
        avgConnections: analysis.metrics?.dependencyDensity || 0,
      },
    },
    'Architecture analysis retrieved'
  );
});

export const analyze = getArchitecture;

export default { analyze, getArchitecture, getLegacyArchitecture, getHotspots, getRisk, getModule };
