/**
 *  - Compensate re-inserts the pre-run snapshot (not another deleteMany)
 *  - Symbol count after rollback equals pre-run count, not zero
 *  - A successful re-index after a failed run produces the correct final set
 *  - execute snapshots previousSymbols before deleting (verify context)
 *  - Repository with no prior index rolls back to 0 symbols (no crash)
 */

import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// ─── In-memory IndexedSymbol store ───────────────────────────────────────────
let symbolStore = [];

const makeSymbolDoc = (overrides = {}) => ({
  repositoryId: 'repo-123',
  repositoryName: 'my-repo',
  owner: 'alice',
  filePath: 'src/index.js',
  symbolName: 'myFunc',
  symbolType: 'function',
  line: 10,
  exportName: null,
  metadata: {},
  indexedAt: new Date('2024-01-01'),
  ...overrides,
});

// Mongoose doc fields that get stripped before re-insert
const withMongooseFields = (doc) => ({
  _id: 'mongo-id-' + Math.random(),
  __v: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...doc,
});

const mockIndexedSymbol = {
  find: jest.fn(async ({ repositoryId }, _proj, opts) => {
    const raw = symbolStore.filter((s) => s.repositoryId === repositoryId);
    if (opts?.lean) return raw;
    return raw.map(withMongooseFields);
  }),
  deleteMany: jest.fn(async ({ repositoryId }) => {
    symbolStore = symbolStore.filter((s) => s.repositoryId !== repositoryId);
    return { deletedCount: 0 };
  }),
  insertMany: jest.fn(async (docs) => {
    symbolStore.push(...docs);
    return docs;
  }),
};

// ─── Module mocks ─────────────────────────────────────────────────────────────
jest.unstable_mockModule('../src/models/IndexedSymbol.model.js', () => ({
  default: mockIndexedSymbol,
}));

jest.unstable_mockModule('../src/queue/sagaQueue.js', () => ({
  default: { enqueue: jest.fn() },
}));

jest.unstable_mockModule('../src/security/fileCrawler.js', () => ({
  crawlRepositoryFiles: jest.fn(() => []),
}));

jest.unstable_mockModule('../src/services/symbolExtractor.js', () => ({
  extractSymbolsFromFiles: jest.fn(() => []),
}));

jest.unstable_mockModule('../src/services/dependencyGraphBuilder.service.js', () => ({
  DependencyGraphBuilder: { replaceEdges: jest.fn(async () => ({ edgeCount: 0 })) },
  extractDependencyEdgesFromFiles: jest.fn(() => []),
}));

jest.unstable_mockModule('../src/services/architectureMapping.service.js', () => ({
  ArchitectureMapping: {
    generateAndPersist: jest.fn(async () => ({ riskScore: 0, generatedAt: new Date() })),
  },
}));

jest.unstable_mockModule('../src/services/healthScoring.service.js', () => ({
  HealthScoring: {
    generateAndPersist: jest.fn(async () => ({
      overallScore: 0,
      healthCategory: 'good',
      generatedAt: new Date(),
    })),
  },
}));

// ─── Dynamic imports after mocks ──────────────────────────────────────────────
const { buildRepositoryIndexSteps } = await import('../src/services/repositoryIndexer.service.js');
const { default: IndexedSymbol } = await import('../src/models/IndexedSymbol.model.js');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const REPO_ID = 'repo-123';
const fakeSession = {};

const makeContext = (overrides = {}) => ({
  repositoryId: REPO_ID,
  repositoryName: 'my-repo',
  owner: 'alice',
  symbols: [],
  previousSymbols: [],
  ...overrides,
});

const getStep = (name) => {
  const steps = buildRepositoryIndexSteps();
  return steps.find((s) => s.name === name);
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('replace_indexed_symbols — snapshot-restore on failure (Issue #480)', () => {
  beforeEach(() => {
    symbolStore = [];
    jest.clearAllMocks();

    // Re-wire mocks after clearAllMocks
    mockIndexedSymbol.find.mockImplementation(async ({ repositoryId }, _proj, opts) => {
      const raw = symbolStore.filter((s) => s.repositoryId === repositoryId);
      if (opts?.lean) return raw;
      return raw.map(withMongooseFields);
    });
    mockIndexedSymbol.deleteMany.mockImplementation(async ({ repositoryId }) => {
      symbolStore = symbolStore.filter((s) => s.repositoryId !== repositoryId);
      return { deletedCount: 0 };
    });
    mockIndexedSymbol.insertMany.mockImplementation(async (docs) => {
      symbolStore.push(...docs);
      return docs;
    });
  });

  // ── 1. execute snapshots previousSymbols into context before deleting ──────
  test('stores a snapshot of pre-existing symbols in context before deleteMany', async () => {
    // Seed two pre-existing symbols
    const pre = [
      makeSymbolDoc({ symbolName: 'preA' }),
      makeSymbolDoc({ symbolName: 'preB' }),
    ];
    symbolStore.push(...pre);

    const step = getStep('replace_indexed_symbols');
    const context = makeContext({ symbols: [] });

    await step.execute(context, fakeSession);

    // context.previousSymbols must hold the pre-run documents (stripped of Mongoose fields)
    expect(context.previousSymbols).toHaveLength(2);
    expect(context.previousSymbols.map((s) => s.symbolName)).toEqual(
      expect.arrayContaining(['preA', 'preB'])
    );
    // _id, __v, createdAt, updatedAt must be stripped
    for (const s of context.previousSymbols) {
      expect(s._id).toBeUndefined();
      expect(s.__v).toBeUndefined();
      expect(s.createdAt).toBeUndefined();
      expect(s.updatedAt).toBeUndefined();
    }
  });

  // ── 2. compensate re-inserts snapshot, not another deleteMany-only ────────
  test('compensate restores pre-run symbol count after insertMany failure', async () => {
    const PRE_COUNT = 3;
    const pre = Array.from({ length: PRE_COUNT }, (_, i) =>
      makeSymbolDoc({ symbolName: `pre${i}` })
    );
    symbolStore.push(...pre);

    const step = getStep('replace_indexed_symbols');

    // Attempt execute: snapshot succeeds, deleteMany commits, insertMany throws
    const newSymbols = [
      { filePath: 'a.js', symbolName: 'newA', symbolType: 'function', line: 1 },
    ];
    mockIndexedSymbol.insertMany.mockRejectedValueOnce(new Error('disk full'));

    const context = makeContext({ symbols: newSymbols });

    await expect(step.execute(context, fakeSession)).rejects.toThrow('disk full');

    // After the failed execute, store is empty (deleteMany committed, insertMany never ran)
    expect(symbolStore.filter((s) => s.repositoryId === REPO_ID)).toHaveLength(0);

    // Run compensate — must restore the snapshot
    await step.compensate(context, fakeSession);

    const restored = symbolStore.filter((s) => s.repositoryId === REPO_ID);
    expect(restored).toHaveLength(PRE_COUNT);
    expect(restored.map((s) => s.symbolName)).toEqual(
      expect.arrayContaining(['pre0', 'pre1', 'pre2'])
    );
  });

  // ── 3. symbol count after rollback equals pre-run count, not zero ─────────
  test('repository symbol count after failed index run equals pre-run count', async () => {
    const ORIGINAL_COUNT = 5;
    symbolStore.push(
      ...Array.from({ length: ORIGINAL_COUNT }, (_, i) =>
        makeSymbolDoc({ symbolName: `orig${i}` })
      )
    );

    const step = getStep('replace_indexed_symbols');
    mockIndexedSymbol.insertMany.mockRejectedValueOnce(new Error('validation error'));

    const context = makeContext({ symbols: [{ filePath: 'x.js', symbolName: 'x', symbolType: 'function', line: 1 }] });

    // execute throws
    await expect(step.execute(context, fakeSession)).rejects.toThrow();
    // compensate restores
    await step.compensate(context, fakeSession);

    // Count must equal original — never zero
    const finalCount = symbolStore.filter((s) => s.repositoryId === REPO_ID).length;
    expect(finalCount).toBe(ORIGINAL_COUNT);
  });

  // ── 4. successful re-index after failed run produces correct final set ─────
  test('a successful re-index after a failed run produces the correct new symbol set', async () => {
    const originalSymbols = [makeSymbolDoc({ symbolName: 'oldFunc' })];
    symbolStore.push(...originalSymbols);

    const step = getStep('replace_indexed_symbols');

    // First run: insertMany fails
    mockIndexedSymbol.insertMany.mockRejectedValueOnce(new Error('network partition'));
    const ctx1 = makeContext({ symbols: [{ filePath: 'b.js', symbolName: 'newFunc', symbolType: 'function', line: 5 }] });
    await expect(step.execute(ctx1, fakeSession)).rejects.toThrow();
    await step.compensate(ctx1, fakeSession);

    // Verify restore
    expect(symbolStore.filter((s) => s.repositoryId === REPO_ID)).toHaveLength(1);
    expect(symbolStore[0].symbolName).toBe('oldFunc');

    // Second run: succeeds
    mockIndexedSymbol.insertMany.mockImplementationOnce(async (docs) => {
      symbolStore.push(...docs);
      return docs;
    });
    const ctx2 = makeContext({ symbols: [{ filePath: 'c.js', symbolName: 'finalFunc', symbolType: 'class', line: 2 }] });
    await step.execute(ctx2, fakeSession);

    const final = symbolStore.filter((s) => s.repositoryId === REPO_ID);
    expect(final).toHaveLength(1);
    expect(final[0].symbolName).toBe('finalFunc');
  });

  // ── 5. repository with no prior index rolls back to 0 symbols (no crash) ──
  test('compensate on a repository with no prior symbols leaves store empty without crashing', async () => {
    // No pre-existing symbols
    const step = getStep('replace_indexed_symbols');
    mockIndexedSymbol.insertMany.mockRejectedValueOnce(new Error('disk full'));

    const context = makeContext({ symbols: [{ filePath: 'd.js', symbolName: 'f', symbolType: 'function', line: 1 }] });

    await expect(step.execute(context, fakeSession)).rejects.toThrow();
    await expect(step.compensate(context, fakeSession)).resolves.not.toThrow();

    expect(symbolStore.filter((s) => s.repositoryId === REPO_ID)).toHaveLength(0);
  });

  // ── 6. crawl_and_extract_symbols has a compensate function (no more missing compensate) ──
  test('crawl_and_extract_symbols step has a compensate function', () => {
    const step = getStep('crawl_and_extract_symbols');
    expect(typeof step.compensate).toBe('function');
  });
});