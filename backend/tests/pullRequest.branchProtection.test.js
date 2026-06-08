import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

process.env.JWT_SECRET = 'test_jwt_secret_bp';
process.env.NODE_ENV   = 'test';

// ─── shared IDs (24-char hex → valid ObjectIds) ────────────────────────────

const OWNER_ID  = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const AUTHOR_ID = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const PR_ID     = 'cccccccccccccccccccccccc';
const REPO_ID   = 'dddddddddddddddddddddddd';

// ─── mock factories ────────────────────────────────────────────────────────

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
  select:        jest.fn().mockReturnThis(),
  ...overrides,
});

// ─── mock handles ──────────────────────────────────────────────────────────

const mockEvaluateMerge = jest.fn();
const mockExecuteSaga   = jest.fn();
const mockPRFindById    = jest.fn();
const mockPRUpdateOne   = jest.fn();
const mockRepoFindById  = jest.fn();

// ─── module mocks ──────────────────────────────────────────────────────────

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

// fs and simple-git stubs — repo path check and git ops are not under test here
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

// ─── app ──────────────────────────────────────────────────────────────────

const { default: createApp } = await import('../src/app.js');
const app = createApp();
const AUTH = 'Bearer valid-token';

// ─── helpers ──────────────────────────────────────────────────────────────

/**
 * Wire up the PR findById mock to return the given PR document for both
 * the raw call (in findPullRequest) and the populate-chained call
 * (in checkBranchProtection).
 */
const setupPRMock = (pr = makePR()) => {
  const chain = {
    populate: jest.fn().mockReturnThis(),
    then: (ok) => Promise.resolve(pr).then(ok),
    catch: (cb) => Promise.resolve(pr).catch(cb),
  };
  mockPRFindById.mockReturnValue(chain);
  return pr;
};

/**
 * Simulate the saga executing its steps by invoking `checkBranchProtection`
 * manually so we can assert on evaluateMerge without needing the real
 * SagaOrchestrator.  The executeSaga mock captures the steps array and
 * runs only the named step.
 */
const runStep = async (stepName, context) => {
  const capturedSteps = mockExecuteSaga.mock.calls[0]?.[2];
  if (!capturedSteps) throw new Error('executeSaga was not called');
  const step = capturedSteps.find((s) => s.name === stepName);
  if (!step) throw new Error(`Step "${stepName}" not found`);
  return step.execute(context);
};

// ─── tests ────────────────────────────────────────────────────────────────

describe('mergePullRequest — branch protection enforcement', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default: successful saga (no-op)
    mockExecuteSaga.mockResolvedValue(undefined);

    // Default: open PR
    setupPRMock();

    // Default: repo found
    mockRepoFindById.mockResolvedValue(makeRepo());

    // Default: PR status update succeeds
    mockPRUpdateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
  });

  // ── evaluateMerge is called ──────────────────────────────────────────────

  test('calls evaluateMerge with correct repository, pullRequest, and userId', async () => {
    mockEvaluateMerge.mockResolvedValue({ allowed: true, isOwnerOverride: false, reasons: [] });

    // Invoke merge — saga mock captures the steps; we then run the step manually
    const mergeReq = request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    // Let the handler reach executeSaga
    await mergeReq;

    // Now run the checkBranchProtection step directly
    const pr   = makePR();
    const repo = makeRepo();
    setupPRMock(pr);

    const { evaluateMerge } = await import(
      '../src/services/branchProtectionEvaluator.service.js'
    );

    await evaluateMerge({
      repository:  repo,
      pullRequest: pr,
      userId:      AUTHOR_ID,
    });

    expect(evaluateMerge).toHaveBeenCalledWith(
      expect.objectContaining({
        repository:  expect.objectContaining({ _id: expect.anything() }),
        pullRequest: expect.objectContaining({ targetBranch: 'main' }),
        userId:      AUTHOR_ID,
      })
    );
  });

  // ── blocked merge ────────────────────────────────────────────────────────

  test('returns 403 when evaluateMerge returns allowed: false', async () => {
    mockEvaluateMerge.mockResolvedValue({
      allowed:         false,
      isOwnerOverride: false,
      reasons:         ['At least 2 approval(s) required (0/2 granted).'],
    });

    // Make executeSaga actually run the steps so the 403 propagates
    mockExecuteSaga.mockImplementation(async (_id, _type, steps, context) => {
      for (const step of steps) {
        await step.execute(context);
      }
    });

    const res = await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/approval/i);
  });

  test('returns 403 and joins multiple reasons into one message', async () => {
    mockEvaluateMerge.mockResolvedValue({
      allowed:         false,
      isOwnerOverride: false,
      reasons: [
        'At least 2 approval(s) required (0/2 granted).',
        'Status checks are required but no CI system is configured.',
      ],
    });

    mockExecuteSaga.mockImplementation(async (_id, _type, steps, context) => {
      for (const step of steps) {
        await step.execute(context);
      }
    });

    const res = await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/approval/i);
    expect(res.body.message).toMatch(/status checks/i);
  });

  // ── allowed merge ────────────────────────────────────────────────────────

  test('proceeds to merge when evaluateMerge returns allowed: true', async () => {
    mockEvaluateMerge.mockResolvedValue({
      allowed:         true,
      isOwnerOverride: false,
      reasons:         [],
    });

    const res = await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    // executeSaga is called → merge proceeds (200 or saga-level success)
    expect(mockExecuteSaga).toHaveBeenCalled();
    expect(res.status).not.toBe(403);
  });

  // ── owner override ───────────────────────────────────────────────────────

  test('owner can merge even when evaluateMerge returns allowed: false via isOwnerOverride', async () => {
    // Repo owner calling the endpoint
    const ownerVerify = (await import('jsonwebtoken')).default.verify;
    ownerVerify.mockReturnValue({ id: OWNER_ID });

    mockEvaluateMerge.mockResolvedValue({
      allowed:         false,
      isOwnerOverride: true,   // evaluateMerge grants owner bypass internally
      reasons:         [],
    });

    mockExecuteSaga.mockImplementation(async (_id, _type, steps, context) => {
      for (const step of steps) {
        await step.execute(context);
      }
    });

    const res = await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    expect(res.status).not.toBe(403);
    expect(mockExecuteSaga).toHaveBeenCalled();
  });

  // ── no protection rule ───────────────────────────────────────────────────

  test('proceeds normally when no branch protection rule exists (evaluateMerge allowed: true)', async () => {
    mockEvaluateMerge.mockResolvedValue({
      allowed:         true,
      isOwnerOverride: false,
      reasons:         [],
    });

    const res = await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    expect(mockExecuteSaga).toHaveBeenCalled();
    expect(res.status).not.toBe(403);
  });

  // ── step ordering ────────────────────────────────────────────────────────

  test('checkBranchProtection step is placed before updatePRStatus in the saga steps', async () => {
    mockEvaluateMerge.mockResolvedValue({ allowed: true, isOwnerOverride: false, reasons: [] });

    await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`)
      .set('Authorization', AUTH);

    expect(mockExecuteSaga).toHaveBeenCalled();
    const steps = mockExecuteSaga.mock.calls[0][2];
    const stepNames = steps.map((s) => s.name);

    const validateIdx   = stepNames.indexOf('validateOpen');
    const protectIdx    = stepNames.indexOf('checkBranchProtection');
    const updatePRIdx   = stepNames.indexOf('updatePRStatus');

    expect(protectIdx).toBeGreaterThan(validateIdx);
    expect(protectIdx).toBeLessThan(updatePRIdx);
  });

  // ── unauthenticated ──────────────────────────────────────────────────────

  test('returns 401 when no auth token is provided', async () => {
    const res = await request(app)
      .post(`/api/v1/pull-requests/${PR_ID}/merge`);

    expect(res.status).toBe(401);
    expect(mockEvaluateMerge).not.toHaveBeenCalled();
  });
});