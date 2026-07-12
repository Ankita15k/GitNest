import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import request from 'supertest';

process.env.JWT_SECRET = 'test_jwt_secret_branch_del_646';
process.env.NODE_ENV = 'test';

jest.unstable_mockModule('../src/config/passport.js', () => ({}));

// IDs
const OWNER_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';

// ─── mocks ────────────────────────────────────────────────────────────────

// Make authMiddleware.protect attach req.user
jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
  protect: (req, _res, next) => {
    req.user = { id: OWNER_ID, _id: OWNER_ID };
    return next();
  },
  optionalProtect: (_req, _res, next) => next(),
  optionalAuth: (_req, _res, next) => next(),
  requirePullRequestAccess: () => (_req, _res, next) => next(),
}));

// Bypass JSON-schema validation to keep test focused
jest.unstable_mockModule('../src/middleware/schemaValidator.js', () => {
  return { default: () => [] };
});

// Mock User + Repository lookups used by branch.controller.js
const mockUserFindOne = jest.fn();
const mockRepoFindOne = jest.fn();

jest.unstable_mockModule('../src/models/User.model.js', () => ({
  default: {
    findOne: mockUserFindOne,
  },
}));

jest.unstable_mockModule('../src/models/Repository.model.js', () => ({
  default: {
    findOne: mockRepoFindOne,
  },
}));

// Mock simple-git so service logic runs without touching real git
const mockBranchLocal = jest.fn();
const mockDeleteLocalBranch = jest.fn();

jest.unstable_mockModule('simple-git', () => {
  return {
    default: () => ({
      branchLocal: mockBranchLocal,
      deleteLocalBranch: mockDeleteLocalBranch,
    }),
  };
});

// ─── app ─────────────────────────────────────────────────────────────────
const { default: createApp } = await import('../src/app.js');
const app = createApp();

// ─── helpers ──────────────────────────────────────────────────────────────
const setupRepositoryLookup = ({ defaultBranch }) => {
  mockUserFindOne.mockResolvedValue({ _id: OWNER_ID });

  mockRepoFindOne.mockResolvedValue({
    owner: OWNER_ID,
    name: 'my-repo',
    defaultBranch,
    visibility: 'public',
    _id: { toString: () => 'repo-id' },
  });

  mockBranchLocal.mockResolvedValue({
    current: 'feature',
    all: ['feature', 'main', 'develop'],
  });

  mockDeleteLocalBranch.mockResolvedValue(undefined);
};

describe('branch deletion — defaultBranch protection (Issue #646)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('defaultBranch = "main": deleting "main" fails with Cannot delete the default branch', async () => {
    setupRepositoryLookup({ defaultBranch: 'main' });

    // Ensure git reports the default branch exists
    mockBranchLocal.mockResolvedValue({
      current: 'feature',
      all: ['feature', 'main'],
    });

    const res = await request(app)
      .delete('/api/v1/users/octo/repos/my-repo/branches/main')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Cannot delete the default branch');
    expect(mockDeleteLocalBranch).not.toHaveBeenCalled();
  });

  test('defaultBranch = "develop": deleting "develop" fails with Cannot delete the default branch', async () => {
    setupRepositoryLookup({ defaultBranch: 'develop' });

    mockBranchLocal.mockResolvedValue({
      current: 'feature',
      all: ['feature', 'develop'],
    });

    const res = await request(app)
      .delete('/api/v1/users/octo/repos/my-repo/branches/develop')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Cannot delete the default branch');
    expect(mockDeleteLocalBranch).not.toHaveBeenCalled();
  });

  test('deleting a non-default branch succeeds', async () => {
    setupRepositoryLookup({ defaultBranch: 'develop' });

    mockBranchLocal.mockResolvedValue({
      current: 'feature',
      all: ['feature', 'main'],
    });

    const res = await request(app)
      .delete('/api/v1/users/octo/repos/my-repo/branches/main')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Branch deleted successfully');
    expect(mockDeleteLocalBranch).toHaveBeenCalledWith('main');
  });

  test('deleting the currently checked-out branch is still rejected', async () => {
    setupRepositoryLookup({ defaultBranch: 'develop' });

    mockBranchLocal.mockResolvedValue({
      current: 'feature',
      all: ['feature', 'develop'],
    });

    const res = await request(app)
      .delete('/api/v1/users/octo/repos/my-repo/branches/feature')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Cannot delete the current branch');
    expect(mockDeleteLocalBranch).not.toHaveBeenCalled();
  });
});
