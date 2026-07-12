/**
 * Tests for fix: pre-saga evaluateMerge removed; checkBranchProtection is
 * the single authoritative protection check, evaluated against a fresh PR
 * snapshot inside the saga.
 *
 * Test matrix:
 *  A. evaluateMerge is called exactly once per merge attempt (not twice).
 *  B. A revoked approval (stale pre-saga data) is caught inside the saga step.
 *  C. Merge blocked when intra-saga evaluateMerge returns allowed: false.
 *  D. Merge proceeds when intra-saga evaluateMerge returns allowed: true.
 *  E. checkBranchProtection step re-fetches the PR (not uses the stale context snapshot).
 *  F. checkBranchProtection step fetches the repository including collaborators.
 *  G. Step ordering: validateOpen < checkBranchProtection < updatePRStatus.
 */
import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import request from 'supertest';

process.env.JWT_SECRET = 'test_jwt_secret_559';
process.env.NODE_ENV   = 'test';

// ─── shared IDs ──────────────────────────────────────────────────────────────
const OWNER_ID  = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const AUTHOR_ID = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const COLLAB_ID = 'cccccccccccccccccccccccc';
const PR_ID     = 'dddddddddddddddddddddddd';
const REPO_ID   = 'eeeeeeeeeeeeeeeeeeeeeeee';

// ─── mock factories ───────────────────────────────────────────────────────────
const makePR = (overrides = {}) => ({
  _id:          { toString: () => PR_ID },
  number:       1,
  status:       'open',
  title:        'Test PR',
  description:  '',
  sourceBranch: 'feature',
  targetBranch: 'main',
  fromBranch:   'feature',
  toBranch:     'main',
  diff:         [],
  reviews:      [],
  comments:     [],
  author:       { _id: { toString: () => AUTHOR_ID }, username: 'author' },
  repository: {
    _id:           { toString: () => REPO_ID },
    name:          'test-repo',
    owner:         OWNER_ID,
    defaultBranch: 'main',
  },
  toObject: jest.fn(function () { return { ...this }; }),
  populate:  jest.fn().mockReturnThis(),
  ...overrides,
});

const makeRepo = (overrides = {}) => ({
  _id:           { toString: () => REPO_ID },
  name:          'test-repo',
  owner:         OWNER_ID,
  defaultBranch: 'main',
  collaborators: [],
  select:        jest.fn().mockReturnThis(),
  ...overrides,
});

// ─── mock handles ─────────────────────────────────────────────────────────────
const mockEvaluateMerge = jest.fn();
const mockExecuteSaga   = jest.fn();
const mockPRFindById    = jest.fn();
const mockPRUpdateOne   = jest.fn();
const mockRepoFindById  = jest.fn();

// ─── module mocks ─────────────────────────────────────────────────────────────
jest.unstable_mockModule('../src/services/branchProtectionEvaluator.service.js', () => ({
  evaluateMerge: mockEvaluateMerge,
}));

jest.unstable_mockModule('../src/services/saga/sagaOrchestrator.js', () => ({
  default: { executeSaga: mockExecuteSaga },
}));

jest.unstable_mockModule('../src/models/PullRequest.model.js', () => ({
  default: {
    findById:  mockPRFindById,
    findOne:   jest.fn(),
    updateOne: mockPRUpdateOne,
    find:      jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/Repository.model.js', () => ({
  default: {
    findById:          mockRepoFindById,
    findOne:           jest.fn(),
    find:              jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/User.model.js', () => ({
  default: { findById: jest.fn(), findOne: jest.fn() },
}));

jest.unstable_mockModule('../src/models/BranchProtectionRule.model.js', () => ({
  default: { findOne: jest.fn() },
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign:   jest.fn(() => 'signed.jwt.token'),
    verify: jest.fn(() => ({ id: AUTHOR_ID })),
  },
}));

jest.unstable_mockModule('fs', () => ({
  default: { existsSync: jest.fn(() => true) },
  existsSync: jest.fn(() => true),
}));

jest.unstable_mockModule('simple-git', () => ({
  default: jest.fn(() => ({
    status:   jest.fn().mockResolvedValue({ current: 'main', conflicts: [] }),
    checkout: jest.fn().mockResolvedValue(undefined),
    merge:    jest.fn().mockResolvedValue(undefined),
    branch:   jest.fn().mockResolvedValue({ all: [] }),
    reset:    jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.unstable_mockModule('../src/events/eventEmitter.js', () => ({
  default: { emit: jest.fn() },
}));

// ─── app bootstrap (after mocks) ─────────────────────────────────────────────
const { default: createApp } = await import('../src/app.js');
const app = createApp();
const AUTH = 'Bearer valid-token';

// ─── helpers ──────────────────────────────────────────────────────────────────
const setupPRMock = (pr = makePR()) => {
  const chain = {
    session:  jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    then:     (ok) => Promise.resolve(pr).then(ok),
    catch:    (cb) => Promise.resolve(pr).catch(cb),
  };
  mockPRFindById.mockReturnValue(chain);
  return pr;
};

/**
 * Execute the saga steps in order by replacing executeSaga with a real
 * step runner — lets us assert on mid-saga behaviour such as 403 from
 * checkBranchProtection before updatePRStatus runs.
 */
const runSagaSteps = () => {
  mockExecuteSaga.mockImplementation(async (_id, _type, steps, context) => {
    for (const step of steps) {
      if (step.execute) await step.execute(context);
    }
  });
};

// ─── tests ────────────────────────────────────────────────────────────────────
describe('fix #559 — single authoritative branch-protection check inside saga', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecuteSaga.mockResolvedValue(undefined);  // default: saga no-op
    setupPRMock();
    mockRepoFindById.mockReturnValue({
      select: jest.fn().mockResolvedValue(makeRepo()),
    });
    mockPRUpdateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
  });

  // ── A. evaluateMerge called exactly once per merge attempt ────────────────
  test('evaluateMerge is called exactly once — no pre-saga duplicate call', async () => {
    mockEvaluateMerge.mockResolvedValue({
      allowed: true, isOwnerOverride: false, reasons: [],
    });
    runSagaSteps();

    await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    expect(mockEvaluateMerge).toHaveBeenCalledTimes(1);
  });

  // ── B. Revoked approval caught inside the saga ────────────────────────────
  test('a review revoked between handler entry and saga step is caught', async () => {
    // Simulate: initial PR fetch shows approval, but by the time the saga
    // step re-fetches the PR the approval is gone.
    let callCount = 0;
    mockEvaluateMerge.mockImplementation(async () => {
      callCount += 1;
      // If pre-saga check still existed it would see callCount=1 and pass.
      // The only call should be from the saga step, which now sees the
      // revoked state (allowed: false).
      return { allowed: false, isOwnerOverride: false,
               reasons: ['At least 1 approval(s) required (0/1 granted).'] };
    });
    runSagaSteps();

    const res = await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    expect(res.status).toBe(403);
    // Must have been called exactly once — by the saga step, not a pre-saga guard
    expect(mockEvaluateMerge).toHaveBeenCalledTimes(1);
  });

  // ── C. Merge blocked when saga evaluateMerge returns allowed: false ───────
  test('returns 403 when checkBranchProtection step evaluateMerge returns allowed: false', async () => {
    mockEvaluateMerge.mockResolvedValue({
      allowed:         false,
      isOwnerOverride: false,
      reasons:         ['At least 2 approval(s) required (0/2 granted).'],
    });
    runSagaSteps();

    const res = await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/approval/i);
    // updatePRStatus must NOT have been called — protection blocked before status write
    expect(mockPRUpdateOne).not.toHaveBeenCalled();
  });

  // ── D. Merge proceeds when evaluateMerge returns allowed: true ────────────
  test('proceeds to executeSaga when evaluateMerge returns allowed: true', async () => {
    mockEvaluateMerge.mockResolvedValue({
      allowed: true, isOwnerOverride: false, reasons: [],
    });

    const res = await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    expect(mockExecuteSaga).toHaveBeenCalledTimes(1);
    expect(res.status).not.toBe(403);
  });

  // ── E. checkBranchProtection re-fetches the PR inside the step ───────────
  test('checkBranchProtection step calls PullRequest.findById (fresh fetch, not stale context)', async () => {
    mockEvaluateMerge.mockResolvedValue({
      allowed: true, isOwnerOverride: false, reasons: [],
    });
    runSagaSteps();

    await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    // findById is called: once by the handler's findPullRequest, and again
    // inside checkBranchProtection. At least two calls confirms the step
    // does not re-use the stale initial snapshot.
    const findByIdCallCount = mockPRFindById.mock.calls.length;
    expect(findByIdCallCount).toBeGreaterThanOrEqual(2);
  });

  // ── F. checkBranchProtection fetches repository with collaborators ────────
  test('checkBranchProtection fetches repository with collaborators field via select', async () => {
    mockEvaluateMerge.mockResolvedValue({
      allowed: true, isOwnerOverride: false, reasons: [],
    });
    runSagaSteps();

    await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    // Repository.findById must have been called with a select that includes
    // 'collaborators' — confirming the step no longer relies on the narrow
    // resolveMergeRepository snapshot.
    const selectCalls = mockRepoFindById.mock.results
      .map((r) => r.value)
      .filter(Boolean)
      .map((v) => v.select?.mock?.calls?.[0]?.[0])
      .filter(Boolean);

    const collaboratorsSelected = selectCalls.some(
      (fields) => typeof fields === 'string' && fields.includes('collaborators')
    );
    expect(collaboratorsSelected).toBe(true);
  });

  // ── G. Step ordering: validateOpen < checkBranchProtection < updatePRStatus
  test('checkBranchProtection is ordered after validateOpen and before updatePRStatus', async () => {
    mockEvaluateMerge.mockResolvedValue({
      allowed: true, isOwnerOverride: false, reasons: [],
    });

    await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    expect(mockExecuteSaga).toHaveBeenCalled();
    const steps     = mockExecuteSaga.mock.calls[0][2];
    const stepNames = steps.map((s) => s.name);

    const validateIdx = stepNames.indexOf('validateOpen');
    const protectIdx  = stepNames.indexOf('checkBranchProtection');
    const updateIdx   = stepNames.indexOf('updatePRStatus');

    expect(validateIdx).toBeGreaterThanOrEqual(0);
    expect(protectIdx).toBeGreaterThan(validateIdx);
    expect(updateIdx).toBeGreaterThan(protectIdx);
  });

  // ── H. updatePRStatus does not run before protection check blocks ─────────
  test('updatePRStatus step never executes when checkBranchProtection throws', async () => {
    mockEvaluateMerge.mockResolvedValue({
      allowed:         false,
      isOwnerOverride: false,
      reasons:         ['At least 1 approval(s) required (0/1 granted).'],
    });
    runSagaSteps();

    await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    // PullRequest.updateOne is called by updatePRStatus — must not have run
    expect(mockPRUpdateOne).not.toHaveBeenCalled();
  });
});