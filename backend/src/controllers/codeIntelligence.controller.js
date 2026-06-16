import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import path from 'path';
import fs from 'fs';
import User from '../models/User.model.js';
import Repository from '../models/Repository.model.js';
import SagaState from '../models/SagaState.model.js';
import IndexedSymbol from '../models/IndexedSymbol.model.js';
import DependencyGraph from '../models/DependencyGraph.model.js';
import { triggerRepositoryIndex, REPOSITORY_INDEX_TYPE } from '../services/repositoryIndexer.service.js';
import { crawlRepositoryFiles } from '../security/fileCrawler.js';
import { extractSymbolsFromFiles } from '../services/symbolExtractor.js';
import { DependencyGraphBuilder } from '../services/dependencyGraphBuilder.service.js';
import { ImpactAnalysis } from '../services/impactAnalysis.service.js';
import { ArchitectureMapping } from '../services/architectureMapping.service.js';
import { HealthScoring } from '../services/healthScoring.service.js';
import { PolicyEvaluation } from '../services/policyEvaluation.service.js';
import paginate, { buildPaginationMeta } from '../utils/paginate.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const resolveRepository = async ({ username, reponame, userId, requireOwner = false }) => {
  const owner = await User.findOne({ username: username.toLowerCase() });
  if (!owner) throw new AppError('Repository not found', 404);

  const repository = await Repository.findOne({ name: reponame, owner: owner._id });
  if (!repository) throw new AppError('Repository not found', 404);

  const isOwner = userId && repository.owner.toString() === userId;
  if (requireOwner && !isOwner) {
    throw new AppError('Unauthorized access to repository indexing', 403);
  }

  if (repository.visibility === 'private' && !isOwner) {
    throw new AppError('Repository not found', 404);
  }

  return { owner, repository };
};

const repositoryPathFor = (ownerId, repoName) => path.resolve(process.cwd(), 'repositories', ownerId.toString(), repoName);

export const triggerIndexing = asyncHandler(async (req, res) => {
  const { username, reponame } = req.params;
  const { owner, repository } = await resolveRepository({
    username,
    reponame,
    userId: req.user.id,
    requireOwner: true,
  });

  const { indexId } = await triggerRepositoryIndex({
    userId: owner._id,
    repositoryId: repository._id,
    repositoryName: repository.name,
    owner: owner.username,
  });

  sendSuccess(res, 202, { indexId, status: 'processing' }, 'Repository indexing initiated');
});

export const getIndexingStatus = asyncHandler(async (req, res, next) => {
  const { username, reponame, indexId } = req.params;
  const { repository } = await resolveRepository({
    username,
    reponame,
    userId: req.user.id,
    requireOwner: true,
  });

  const sagaState = await SagaState.findOne({ sagaId: indexId, type: REPOSITORY_INDEX_TYPE });
  if (!sagaState || sagaState.metadata?.repositoryId !== repository._id.toString()) {
    return next(new AppError('Indexing job not found', 404));
  }

  const data = {
    indexId: sagaState.sagaId,
    status: sagaState.status,
    createdAt: sagaState.createdAt,
    updatedAt: sagaState.updatedAt,
    retryCount: sagaState.retryCount,
  };

  if (sagaState.status === 'completed') {
    data.summary = {
      fileCount: sagaState.metadata.fileCount || 0,
      symbolCount: sagaState.metadata.symbolCount || 0,
      dependencyEdgeCount: sagaState.metadata.dependencyEdgeCount || 0,
      indexedAt: sagaState.metadata.indexedAt,
    };
  } else if (sagaState.status === 'rolled_back' || sagaState.status === 'failed') {
    data.error = sagaState.failedStep ? `Failed during step: ${sagaState.failedStep}` : 'Indexing job failed';
  }

  sendSuccess(res, 200, data, 'Repository indexing status retrieved');
});

export const searchSymbols = asyncHandler(async (req, res) => {
  const { username, reponame } = req.params;
  const { q, symbolType } = req.query;
  const { repository } = await resolveRepository({
    username,
    reponame,
    userId: req.user?.id,
  });

  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const query = {
    repositoryId: repository._id,
    symbolName: { $regex: escapeRegex(q), $options: 'i' },
  };
  if (symbolType) query.symbolType = symbolType;

  const [symbols, totalCount] = await Promise.all([
    IndexedSymbol.find(query).sort({ symbolName: 1, filePath: 1 }).skip(skip).limit(limit),
    IndexedSymbol.countDocuments(query),
  ]);

  sendSuccess(
    res,
    200,
    { symbols, pagination: buildPaginationMeta(page, limit, totalCount) },
    'Symbols retrieved successfully'
  );
});

export const getSymbolDetails = asyncHandler(async (req, res, next) => {
  const { username, reponame, symbolId } = req.params;
  const { repository } = await resolveRepository({
    username,
    reponame,
    userId: req.user?.id,
  });

  const symbol = await IndexedSymbol.findOne({ _id: symbolId, repositoryId: repository._id });
  if (!symbol) {
    return next(new AppError('Symbol not found', 404));
  }

  sendSuccess(res, 200, symbol, 'Symbol details retrieved');
});

export const rebuildDependencies = asyncHandler(async (req, res) => {
  const { username, reponame } = req.params;
  const { owner, repository } = await resolveRepository({
    username,
    reponame,
    userId: req.user.id,
    requireOwner: true,
  });

  const repoPath = repositoryPathFor(owner._id, repository.name);
  if (!fs.existsSync(repoPath)) {
    throw new AppError('Repository directory not found', 404);
  }

  const files = crawlRepositoryFiles(repoPath);
  const symbols = extractSymbolsFromFiles(files);
  const { edgeCount } = await DependencyGraphBuilder.rebuild({
    repositoryId: repository._id,
    files,
    symbols,
  });
  await ArchitectureMapping.generateAndPersist({
    repositoryId: repository._id,
    repositoryName: repository.name,
  });
  const health = await HealthScoring.generateAndPersist({
    repositoryId: repository._id,
    repositoryName: repository.name,
  });
  await PolicyEvaluation.evaluateAndPersist({
    repositoryId: repository._id,
    repositoryName: repository.name,
    health,
  });

  sendSuccess(res, 200, { edgeCount }, 'Dependency graph rebuilt');
});

export const listDependencies = asyncHandler(async (req, res) => {
  const { username, reponame } = req.params;
  const { dependencyType, file, symbol } = req.query;
  const { repository } = await resolveRepository({
    username,
    reponame,
    userId: req.user.id,
    requireOwner: true,
  });

  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const query = { repositoryId: repository._id };
  if (dependencyType) query.dependencyType = dependencyType;
  if (file) query.filePath = file;
  if (symbol) {
    query.$or = [
      { sourceSymbol: { $regex: escapeRegex(symbol), $options: 'i' } },
      { targetSymbol: { $regex: escapeRegex(symbol), $options: 'i' } },
    ];
  }

  const [dependencies, totalCount] = await Promise.all([
    DependencyGraph.find(query).sort({ filePath: 1, dependencyType: 1 }).skip(skip).limit(limit),
    DependencyGraph.countDocuments(query),
  ]);

  sendSuccess(
    res,
    200,
    { dependencies, pagination: buildPaginationMeta(page, limit, totalCount) },
    'Dependencies retrieved successfully'
  );
});

export const getDependencyImpact = asyncHandler(async (req, res) => {
  const { username, reponame } = req.params;
  const { file, symbol, depth } = req.query;
  const { repository } = await resolveRepository({
    username,
    reponame,
    userId: req.user.id,
  });

  const impact = await ImpactAnalysis.analyze({
    repositoryId: repository._id,
    file,
    symbol,
    maxDepth: depth ? Number(depth) : 3,
  });

  sendSuccess(res, 200, impact, 'Dependency impact retrieved');
});

export const getSymbolDependencies = asyncHandler(async (req, res) => {
  const { username, reponame, symbolName } = req.params;
  const { repository } = await resolveRepository({
    username,
    reponame,
    userId: req.user.id,
  });

  const [dependencies, dependents] = await Promise.all([
    DependencyGraph.find({ repositoryId: repository._id, sourceSymbol: symbolName }).sort({ filePath: 1 }),
    DependencyGraph.find({ repositoryId: repository._id, targetSymbol: symbolName }).sort({ filePath: 1 }),
  ]);

  sendSuccess(res, 200, { symbolName, dependencies, dependents }, 'Symbol dependencies retrieved');
});