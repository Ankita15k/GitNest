import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import sagaQueue from '../queue/sagaQueue.js';
import { crawlRepositoryFiles } from '../security/fileCrawler.js';
import IndexedSymbol from '../models/IndexedSymbol.model.js';
import { extractSymbolsFromFiles } from './symbolExtractor.js';
import { DependencyGraphBuilder, extractDependencyEdgesFromFiles } from './dependencyGraphBuilder.service.js';
import { ArchitectureMapping } from './architectureMapping.service.js';
import { HealthScoring } from './healthScoring.service.js';
import { PolicyEvaluation } from './policyEvaluation.service.js';

export const REPOSITORY_INDEX_TYPE = 'REPOSITORY_INDEX';

export const buildRepositoryIndexSteps = () => [
  {
    name: 'crawl_and_extract_symbols',
    execute: async (context) => {
      const { userId, repoName } = context;
      const repoPath = path.resolve(process.cwd(), 'repositories', userId, repoName);

      if (!fs.existsSync(repoPath)) {
        throw new Error(`Repository directory does not exist at path: ${repoPath}`);
      }

      const files = await crawlRepositoryFiles(repoPath);
      const symbols = extractSymbolsFromFiles(files);
      const dependencyEdges = extractDependencyEdgesFromFiles(files, symbols);

      return { fileCount: files.length, symbols, dependencyEdges };
    },
    // crawl_and_extract is read-only; nothing to undo
    compensate: async () => {},
  },
  {
    name: 'replace_indexed_symbols',
    execute: async (context, session) => {
      const { repositoryId, repositoryName, owner, symbols } = context;
      const indexedAt = new Date();

      // Snapshot the current symbols BEFORE any destructive write.
      // The compensate function uses this snapshot to restore the prior state
      // if insertMany fails partway through (see issue #480).
      // We use lean() to get plain objects that can be re-inserted directly.
      const previousSymbols = await IndexedSymbol.find({ repositoryId }, null, {
        session,
        lean: true,
      });
      // Strip Mongoose-managed fields so the documents can be cleanly re-inserted.
      context.previousSymbols = previousSymbols.map(({ _id, __v, createdAt, updatedAt, ...rest }) => rest);

      // Delete all existing symbols for this repository
      await IndexedSymbol.deleteMany({ repositoryId }, { session });

      const documents = symbols.map((symbol) => ({
        repositoryId,
        repositoryName,
        owner,
        filePath: symbol.filePath,
        symbolName: symbol.symbolName,
        symbolType: symbol.symbolType,
        line: symbol.line,
        exportName: symbol.exportName,
        metadata: symbol.metadata,
        indexedAt,
      }));

      if (documents.length > 0) {
        await IndexedSymbol.insertMany(documents, { session });
      }

      return { symbolCount: documents.length, indexedAt };
    },
    compensate: async (context, session) => {
      const { repositoryId, previousSymbols } = context;

      // Remove any partially-inserted symbols from the failed execute attempt
      await IndexedSymbol.deleteMany({ repositoryId }, { session });

      // Restore the pre-run snapshot so the repository is left exactly as it
      // was before the failed index run. If previousSymbols is empty or
      // undefined (e.g. the repository had no prior index), this is a no-op.
      if (previousSymbols && previousSymbols.length > 0) {
        await IndexedSymbol.insertMany(previousSymbols, { session });
      }
    },
  },
  {
    name: 'replace_dependency_graph',
    execute: async (context, session) => {
      const { repositoryId, dependencyEdges } = context;
      const { edgeCount } = await DependencyGraphBuilder.replaceEdges({
        repositoryId,
        edges: dependencyEdges,
        session,
      });
      return { dependencyEdgeCount: edgeCount, dependencyEdges: [], symbols: [] };
    },
  },
  {
    name: 'replace_architecture_analysis',
    execute: async (context, session) => {
      const { repositoryId, repositoryName } = context;
      const analysis = await ArchitectureMapping.generateAndPersist({
        repositoryId,
        repositoryName,
        session,
      });

      return {
        architectureRiskScore: analysis.riskScore,
        architectureGeneratedAt: analysis.generatedAt,
      };
    },
  },
  {
    name: 'generate_repository_health',
    execute: async (context, session) => {
      const { repositoryId, repositoryName } = context;
      const health = await HealthScoring.generateAndPersist({
        repositoryId,
        repositoryName,
        session,
      });

      return {
        healthScore: health.overallScore,
        healthCategory: health.healthCategory,
        healthGeneratedAt: health.generatedAt,
      };
    },
  },
  {
    name: 'generate_repository_compliance',
    execute: async (context, session) => {
      const { repositoryId, repositoryName } = context;
      const compliance = await PolicyEvaluation.evaluateAndPersist({
        repositoryId,
        repositoryName,
        session,
      });

      return {
        complianceStatus: compliance.complianceStatus,
        complianceScore: compliance.complianceScore,
        complianceGeneratedAt: compliance.generatedAt,
      };
    },
  },
];

export const triggerRepositoryIndex = async ({ userId, repositoryId, repositoryName, owner }) => {
  const indexId = uuidv4();
  const initialContext = {
    userId: userId.toString(),
    repositoryId: repositoryId.toString(),
    repositoryName,
    repoName: repositoryName,
    owner,
    fileCount: 0,
    symbolCount: 0,
    dependencyEdgeCount: 0,
    dependencyEdges: [],
    symbols: [],
    previousSymbols: [],
  };

  const promise = sagaQueue.enqueue(
    indexId,
    REPOSITORY_INDEX_TYPE,
    buildRepositoryIndexSteps(),
    initialContext,
    { maxRetries: 2, retryDelayMs: 200 }
  );

  return { indexId, promise };
};