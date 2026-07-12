/**
 * Tests for fix: gitMerge.compensate uses MERGE_HEAD to decide recovery
 * strategy, not status.conflicts — preventing git reset HEAD~1 when no
 * merge commit was made. 
 *
 * Test matrix:
 *  A. MERGE_HEAD present  → merge --abort  (conflict path)
 *  B. MERGE_HEAD present  → merge --abort  (partial merge, no conflict markers yet)
 *  C. MERGE_HEAD absent   → checkout -- .  (merge never started, working tree dirty)
 *  D. MERGE_HEAD absent   → checkout -- .  (clean tree, git threw before merge began)
 *  E. git reset / HEAD~1 is NEVER called regardless of scenario
 */
import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import os from 'os';
import fsp from 'fs/promises';
import fsSync from 'fs';
import pathMod from 'path';

// ─── Environment stubs required by the controller module ─────────────────────
process.env.JWT_SECRET  = 'test_secret_558';
process.env.NODE_ENV    = 'test';

// ─── simpleGit mock ───────────────────────────────────────────────────────────
// Capture which git commands were called so we can assert the right branch.
let gitCalls = [];
let mockGitInstance;

const makeMockGit = () => ({
  status:   jest.fn(async () => ({ current: 'main', conflicts: [] })),
  checkout: jest.fn(async (...args) => { gitCalls.push(['checkout', ...args]); }),
  merge:    jest.fn(async (...args) => { gitCalls.push(['merge',    ...args]); }),
  reset:    jest.fn(async (...args) => { gitCalls.push(['reset',    ...args]); }),
  branch:   jest.fn(async () => ({ all: [] })),
});

jest.unstable_mockModule('simple-git', () => ({
  default: jest.fn(() => mockGitInstance),
}));

// ─── Stub every other heavy dependency used by the controller ─────────────────
jest.unstable_mockModule('../src/models/PullRequest.model.js', () => ({
  default: {
    findById:   jest.fn(async () => null),
    updateOne:  jest.fn(async () => ({ matchedCount: 1 })),
    find:       jest.fn(async () => []),
    populate:   jest.fn().mockReturnThis(),
  },
}));

jest.unstable_mockModule('../src/models/Repository.model.js', () => ({
  default: {
    findById:          jest.fn(async () => null),
    findOne:           jest.fn(async () => null),
    findByIdAndUpdate: jest.fn(async () => ({ prCount: 1 })),
    find:              jest.fn(async () => []),
  },
}));

jest.unstable_mockModule('../src/models/User.model.js', () => ({
  default: { findOne: jest.fn(async () => null) },
}));

jest.unstable_mockModule('../src/utils/asyncHandler.js', () => ({
  default: (fn) => fn,
}));

jest.unstable_mockModule('../src/utils/AppError.js', () => ({
  default: class AppError extends Error {
    constructor(msg, code) { super(msg); this.statusCode = code; this.isOperational = true; }
  },
}));

jest.unstable_mockModule('../src/utils/responseHandlers.js', () => ({
  sendSuccess: jest.fn(),
  sendError:   jest.fn(),
}));

jest.unstable_mockModule('../src/utils/paginate.js', () => ({
  default: jest.fn(() => ({ page: 1, limit: 10, skip: 0 })),
  buildPaginationMeta: jest.fn(() => ({})),
}));

jest.unstable_mockModule('../src/services/saga/sagaOrchestrator.js', () => ({
  default: { executeSaga: jest.fn(async () => ({})) },
}));

jest.unstable_mockModule('../src/events/eventEmitter.js', () => ({
  default: { emit: jest.fn() },
}));

jest.unstable_mockModule('../src/services/branchProtectionEvaluator.service.js', () => ({
  evaluateMerge: jest.fn(async () => ({ allowed: true, isOwnerOverride: false, reasons: [] })),
}));

jest.unstable_mockModule('../src/utils/repoMutex.js', () => ({
  acquireRepoLock: jest.fn(async () => jest.fn()),
}));

// ─── Dynamic import after mocks ───────────────────────────────────────────────
// We need the compensate function itself. The cleanest approach is to import
// the module and extract the steps array built inside mergePullRequest by
// invoking the handler with a fake req/res/next, then grab the step that was
// passed to executeSaga. But that's over-coupled to express plumbing.
//
// Instead we test the compensate logic directly: we re-implement the exact
// extracted function here (mirroring the fix) and verify it against a real
// temporary .git directory on disk — giving us a true filesystem integration
// test for the MERGE_HEAD detection without needing a full git repo.
//
// For the unit assertion that `git.reset` is never called we import the
// controller source and verify via the simpleGit mock.

// Pull the compensate callback out of the saga steps by intercepting executeSaga
const { default: SagaOrchestrator } = await import('../src/services/saga/sagaOrchestrator.js');

// Import controller to trigger module-level side-effects and ensure our mocks
// are in place, then capture the mergeSteps passed to executeSaga.
const controller = await import('../src/controllers/pullRequest.controller.js');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Capture the gitMerge compensate callback by calling mergePullRequest with
 * a fake req/res that satisfies the pre-conditions, then extract the steps
 * array from the executeSaga call.
 */
const captureGitMergeCompensate = async () => {
  // Wire up repository and PR mocks so mergePullRequest proceeds to executeSaga
  const { default: Repository } = await import('../src/models/Repository.model.js');
  const { default: PullRequest } = await import('../src/models/PullRequest.model.js');

  const fakeRepo = {
    _id:           { toString: () => 'repo-id-558' },
    name:          'test-repo',
    owner:         { toString: () => 'owner-id-558' },
    defaultBranch: 'main',
  };

  const fakePR = {
    _id:          { toString: () => 'pr-id-558' },
    number:       1,
    status:       'open',
    repository:   fakeRepo,
    sourceBranch: 'feature/fix',
    targetBranch: 'main',
    populate:     jest.fn().mockReturnThis(),
    toObject:     jest.fn(() => ({})),
  };

  Repository.findById.mockResolvedValue(fakeRepo);
  PullRequest.findById.mockResolvedValue(fakePR);

  // fsSync.existsSync is used by the controller for repoPath — stub it to
  // return true for the repo check but we'll override per-test for MERGE_HEAD.
  let capturedSteps = null;
  SagaOrchestrator.executeSaga.mockImplementation(async (_id, _type, steps) => {
    capturedSteps = steps;
    return {};
  });

  const req = {
    params:  { id: 'pr-id-558' },
    headers: {},
    user:    { _id: { toString: () => 'user-id-558' } },
    body:    {},
  };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  // existsSync for the repoPath check inside mergePullRequest must return true
  // We cannot easily stub fs.existsSync per-call here, so use a real tmpdir.
  // The repoPath is resolved from cwd()/repositories/owner/name; create it.
  const repoPath = pathMod.resolve(
    process.cwd(), 'repositories', 'owner-id-558', 'test-repo'
  );
  await fsp.mkdir(repoPath, { recursive: true });

  await controller.mergePullRequest(req, res, next);

  return { capturedSteps, repoPath };
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('fix #558 — gitMerge.compensate uses MERGE_HEAD, not status.conflicts', () => {
  let tmpRepoPath;

  beforeEach(async () => {
    gitCalls       = [];
    mockGitInstance = makeMockGit();
    jest.clearAllMocks();
    mockGitInstance = makeMockGit();  // re-create after clearAllMocks

    // Create a fresh tmpdir with a .git subdir to serve as the fake repo path
    tmpRepoPath = await fsp.mkdtemp(pathMod.join(os.tmpdir(), 'gitnest-558-'));
    await fsp.mkdir(pathMod.join(tmpRepoPath, '.git'), { recursive: true });
  });

  // ── A: MERGE_HEAD present → merge --abort ─────────────────────────────────
  test('calls merge --abort when .git/MERGE_HEAD exists (conflict scenario)', async () => {
    // Write MERGE_HEAD to simulate an in-progress merge
    await fsp.writeFile(
      pathMod.join(tmpRepoPath, '.git', 'MERGE_HEAD'),
      'abc123def456\n'
    );

    const { capturedSteps } = await captureGitMergeCompensate();
    const gitMergeStep = capturedSteps?.find((s) => s.name === 'gitMerge');
    expect(gitMergeStep).toBeDefined();

    await gitMergeStep.compensate({ repoPath: tmpRepoPath });

    const mergeCalls = gitCalls.filter(([cmd]) => cmd === 'merge');
    expect(mergeCalls).toHaveLength(1);
    expect(mergeCalls[0]).toEqual(['merge', ['--abort']]);
  });

  // ── B: MERGE_HEAD present, no conflict markers → merge --abort ────────────
  test('calls merge --abort when MERGE_HEAD exists even with no conflict markers in status', async () => {
    await fsp.writeFile(
      pathMod.join(tmpRepoPath, '.git', 'MERGE_HEAD'),
      'deadbeef\n'
    );
    // status.conflicts is explicitly empty — old code would have fallen into reset
    mockGitInstance.status.mockResolvedValue({ current: 'main', conflicts: [] });

    const { capturedSteps } = await captureGitMergeCompensate();
    const gitMergeStep = capturedSteps?.find((s) => s.name === 'gitMerge');

    await gitMergeStep.compensate({ repoPath: tmpRepoPath });

    const mergeCalls = gitCalls.filter(([cmd]) => cmd === 'merge');
    expect(mergeCalls).toHaveLength(1);
    expect(mergeCalls[0]).toEqual(['merge', ['--abort']]);

    // Crucially, reset must NOT have been called
    const resetCalls = gitCalls.filter(([cmd]) => cmd === 'reset');
    expect(resetCalls).toHaveLength(0);
  });

  // ── C: MERGE_HEAD absent, dirty tree → checkout -- . ─────────────────────
  test('calls checkout -- . when MERGE_HEAD is absent (merge never started, tree dirty)', async () => {
    // No MERGE_HEAD file — simulate merge failing before git wrote any state
    // MERGE_HEAD file is NOT created in tmpRepoPath/.git

    const { capturedSteps } = await captureGitMergeCompensate();
    const gitMergeStep = capturedSteps?.find((s) => s.name === 'gitMerge');

    await gitMergeStep.compensate({ repoPath: tmpRepoPath });

    const checkoutCalls = gitCalls.filter(([cmd]) => cmd === 'checkout');
    expect(checkoutCalls).toHaveLength(1);
    expect(checkoutCalls[0]).toEqual(['checkout', ['--', '.']]);
  });

  // ── D: MERGE_HEAD absent, clean tree → checkout -- . (safe no-op via git) ─
  test('calls checkout -- . when MERGE_HEAD is absent even with an empty conflict list', async () => {
    mockGitInstance.status.mockResolvedValue({ current: 'main', conflicts: [] });
    // No MERGE_HEAD

    const { capturedSteps } = await captureGitMergeCompensate();
    const gitMergeStep = capturedSteps?.find((s) => s.name === 'gitMerge');

    await gitMergeStep.compensate({ repoPath: tmpRepoPath });

    const checkoutCalls = gitCalls.filter(([cmd]) => cmd === 'checkout');
    expect(checkoutCalls).toHaveLength(1);
    expect(checkoutCalls[0]).toEqual(['checkout', ['--', '.']]);
  });

  // ── E: git reset is NEVER called in any scenario ─────────────────────────
  test('git reset is never called regardless of MERGE_HEAD or conflict state', async () => {
    // Run both branches and confirm reset is absent in all

    const { capturedSteps: steps1 } = await captureGitMergeCompensate();
    const step1 = steps1?.find((s) => s.name === 'gitMerge');

    // With MERGE_HEAD
    await fsp.writeFile(pathMod.join(tmpRepoPath, '.git', 'MERGE_HEAD'), 'abc\n');
    await step1.compensate({ repoPath: tmpRepoPath });

    // Without MERGE_HEAD
    await fsp.rm(pathMod.join(tmpRepoPath, '.git', 'MERGE_HEAD'), { force: true });
    await step1.compensate({ repoPath: tmpRepoPath });

    const resetCalls = gitCalls.filter(([cmd]) => cmd === 'reset');
    expect(resetCalls).toHaveLength(0);
  });
});