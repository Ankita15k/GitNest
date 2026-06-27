import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import request from 'supertest';

process.env.JWT_SECRET = 'test_jwt_secret_bp606';
process.env.NODE_ENV = 'test';

// ─── IDs ────────────────────────────────────────────────────────────────
const OWNER_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const RULE_ID = 'bbbbbbbbbbbbbbbbbbbbbbbb';

// ─── mocks ───────────────────────────────────────────────────────────────

// Make authMiddleware.protect attach req.user
jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
  protect: (req, _res, next) => {
    req.user = { id: OWNER_ID, _id: OWNER_ID };
    return next();
  },
}));

// Bypass JSON-schema validation to keep test focused on service validation
jest.unstable_mockModule('../src/middleware/schemaValidator.js', () => {
  return () => [];
});

// Mock models used by branchProtection.controller -> service
const mockUserFindOne = jest.fn();
const mockRepoFindOne = jest.fn();

const mockBranchRuleFindOne = jest.fn();
const mockBranchRuleCreate = jest.fn();
const mockRuleSave = jest.fn();

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

jest.unstable_mockModule('../src/models/BranchProtectionRule.model.js', () => ({
  default: {
    findOne: mockBranchRuleFindOne,
    create: mockBranchRuleCreate,
  },
}));

// ─── app ─────────────────────────────────────────────────────────────────
const { default: createApp } = await import('../src/app.js');
const app = createApp();

// ─── helpers ─────────────────────────────────────────────────────────────

const setupRepositoryLookup = () => {
  mockUserFindOne.mockResolvedValue({ _id: OWNER_ID });
  mockRepoFindOne.mockResolvedValue({
    owner: OWNER_ID,
    _id: { toString: () => 'repo-id' },
  });
};

describe('branchProtection service validation — requireStatusChecks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupRepositoryLookup();

    // Default: no existing rule
    mockBranchRuleFindOne.mockResolvedValue(null);

    // Default: if createRule proceeded, fail the test by having it called unexpectedly
    mockBranchRuleCreate.mockImplementation(() => {
      throw new Error('BranchProtectionRule.create should not be called when validation fails');
    });
  });

  test('creating a rule with requireStatusChecks=true returns 422 and does not persist', async () => {
    const res = await request(app)
      .post('/api/v1/users/octo/settings/branch-protection')
      .send({
        branchPattern: 'main',
        requirePullRequest: true,
        requiredApprovalsCount: 2,
        requireStatusChecks: true,
      })
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/status checks/i);

    expect(mockBranchRuleCreate).not.toHaveBeenCalled();
  });

  test('updating a rule with requireStatusChecks=true returns 422 and does not persist', async () => {
    // updateRule first checks rule existence via BranchProtectionRule.findOne(_id + repositoryId)
    mockBranchRuleFindOne.mockResolvedValue({
      _id: RULE_ID,
      repositoryId: 'repo-id',
      save: mockRuleSave,
    });

    const res = await request(app)
      .put(`/api/v1/users/octo/settings/branch-protection/${RULE_ID}`)
      .send({
        branchPattern: 'main',
        requirePullRequest: true,
        requiredApprovalsCount: 2,
        requireStatusChecks: true,
      })
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/status checks/i);

    // rule.save() must never be called because validation should happen before persisting
    expect(mockRuleSave).not.toHaveBeenCalled();
  });
});
