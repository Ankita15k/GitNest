import { jest, describe, beforeEach, expect, test } from '@jest/globals';
import request from 'supertest';

process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const mockUserFindById = jest.fn();
const mockRepoFindById = jest.fn();
const mockRepoFindOne = jest.fn();
const mockPrFind = jest.fn();
const mockPrFindById = jest.fn();
const mockPrFindOne = jest.fn();
const mockPrCreate = jest.fn();
const mockPrCountDocuments = jest.fn();
const mockVerify = jest.fn(() => ({ id: 'user-id' }));

const chain = (value) => {
  const query = {
    populate: jest.fn(() => query),
    sort: jest.fn(() => query),
    skip: jest.fn(() => query),
    limit: jest.fn(() => query),
    select: jest.fn(() => Promise.resolve(value)),
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
  };
  return query;
};

const makePullRequest = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  id: '507f1f77bcf86cd799439011',
  number: 1,
  title: 'Add contract tests',
  description: 'Adds API contract coverage',
  status: 'open',
  author: { username: 'tester' },
  repository: { name: 'gitnest' },
  sourceBranch: 'feature/contracts',
  targetBranch: 'main',
  fromBranch: 'feature/contracts',
  toBranch: 'main',
  comments: [],
  reviews: [],
  diff: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  toObject: jest.fn(function toObject() {
    return { ...this };
  }),
  save: jest.fn().mockResolvedValue(),
  ...overrides,
});

await jest.unstable_mockModule('../../src/models/User.model.js', () => ({
  default: {
    findById: mockUserFindById,
  },
}));

await jest.unstable_mockModule('../../src/models/Repository.model.js', () => ({
  default: {
    findById: mockRepoFindById,
    findOne: mockRepoFindOne,
  },
}));

await jest.unstable_mockModule('../../src/models/PullRequest.model.js', () => ({
  default: {
    find: mockPrFind,
    findById: mockPrFindById,
    findOne: mockPrFindOne,
    create: mockPrCreate,
    countDocuments: mockPrCountDocuments,
  },
}));

await jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: mockVerify,
    sign: jest.fn(() => 'signed.jwt.token'),
  },
}));

const { default: createApp } = await import('../../src/app.js');
const app = createApp();

describe('pull request contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserFindById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439012',
        id: 'user-id',
        username: 'tester',
      }),
    });
  });

  test('lists pull requests with standardized envelope', async () => {
    mockPrFind.mockReturnValue(chain([makePullRequest()]));
    mockPrCountDocuments.mockResolvedValue(1);

    const res = await request(app).get('/api/v1/pull-requests');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Pull requests fetched successfully',
      data: {
        counts: { open: 1, closed: 1, merged: 1 },
      },
    });
    expect(res.body.data.pullRequests[0]).toMatchObject({
      title: 'Add contract tests',
      fromBranch: 'feature/contracts',
      toBranch: 'main',
    });
  });

  test('rejects invalid create payload with error contract', async () => {
    const res = await request(app)
      .post('/api/v1/pull-requests')
      .set('Authorization', 'Bearer valid-token')
      .send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
    });
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});
