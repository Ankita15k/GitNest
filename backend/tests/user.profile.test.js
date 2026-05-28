/**
 * Regression tests for the getUserProfile endpoint.
 *
 * Verifies that internal MongoDB ObjectIds cannot be used to enumerate
 * user documents via the public GET /api/v1/users/:username route.
 */

import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/models/User.model.js', () => ({
  default: {
    findOne: jest.fn(),
    findById: jest.fn(),
// ---------------------------------------------------------------------------
// Minimal mock infrastructure — replicate just enough of the Express/Mongoose
// surface area needed to exercise getUserProfile in isolation.
// ---------------------------------------------------------------------------

const mockNext = jest.fn();

const buildRes = () => {
  const res = { statusCode: null, body: null };

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  res.json = (body) => {
    res.body = body;
    return res;
  };

  res.locals = {};

  return res;
};

const buildReq = (username) => ({
  params: { username },
});

// ---------------------------------------------------------------------------
// Inline stub for the User model — avoids a live MongoDB connection.
// ---------------------------------------------------------------------------

let mockStubbedUser = null;

jest.mock('../src/models/User.model.js', () => ({
  default: {
    findOne: jest.fn(async ({ username }) => {
      if (
        mockStubbedUser &&
        mockStubbedUser.username === username
      ) {
        return mockStubbedUser;
      }

      return null;
    }),
  },
}));

jest.unstable_mockModule('mongoose', () => ({
  default: {
    Types: { ObjectId: { isValid: () => false } },
    Types: {
      ObjectId: {
        isValid: () => false,
      },
    },

    startSession: jest.fn(async () => ({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
      inTransaction: jest.fn(() => false),
    })),
  },
}));

jest.unstable_mockModule('../src/utils/logActivitySafely.js', () => ({
  logActivitySafely: jest.fn(async () => {}),
}));

jest.unstable_mockModule('../src/config/db.js', () => ({ default: jest.fn() }));

const { default: User } = await import('../src/models/User.model.js');
const { getUserProfile } = await import('../src/controllers/user.controller.js');
const { getUserProfile } = await import(
  '../src/controllers/user.controller.js'
);

const buildRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  res.locals = {};
  return res;
};

const buildReq = (username) => ({ params: { username } });

describe('getUserProfile', () => {
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  test('returns 200 and the user document for a valid username', async () => {
    const stubbedUser = { username: 'alice', email: 'alice@example.com', bio: 'Hello' };
    User.findOne.mockResolvedValue(stubbedUser);
    mockStubbedUser = null;
  });

  test('returns 200 and the user document for a valid username', async () => {
    mockStubbedUser = {
      username: 'alice',
      email: 'alice@example.com',
      bio: 'Hello',
    };

    const req = buildReq('alice');
    const res = buildRes();

    const res = buildRes();
    await getUserProfile(buildReq('alice'), res, mockNext);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.username).toBe('alice');
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('is case-insensitive — uppercased username resolves the same document', async () => {
    User.findOne.mockResolvedValue({ username: 'alice', email: 'alice@example.com' });
    mockStubbedUser = {
      username: 'alice',
      email: 'alice@example.com',
    };

    const req = buildReq('ALICE');
    const res = buildRes();

    const res = buildRes();
    await getUserProfile(buildReq('ALICE'), res, mockNext);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.username).toBe('alice');
  });

  test('returns 404 when username does not exist', async () => {
    User.findOne.mockResolvedValue(null);
    mockStubbedUser = null;

    const req = buildReq('ghost');
    const res = buildRes();

    const res = buildRes();
    await getUserProfile(buildReq('ghost'), res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);

    const err = mockNext.mock.calls[0][0];

    expect(err.statusCode).toBe(404);
  });

  test('returns 404 when a valid MongoDB ObjectId is supplied as the username', async () => {
    const objectId = '507f1f77bcf86cd799439011';
    User.findOne.mockResolvedValue(null);

    mockStubbedUser = {
      username: objectId,
      email: 'internal@example.com',
    };

    const { default: User } = await import(
      '../src/models/User.model.js'
    );

    User.findOne.mockImplementation(async ({ username }) => {
      if (username === 'realusername') {
        return mockStubbedUser;
      }

      return null;
    });

    const req = buildReq(objectId);
    const res = buildRes();

    const res = buildRes();
    await getUserProfile(buildReq(objectId), res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);

    const err = mockNext.mock.calls[0][0];

    expect(err.statusCode).toBe(404);
    expect(res.body).toBeNull();
  });

  test('never calls User.findById on any input', async () => {
    User.findOne.mockResolvedValue(null);
    const { default: User } = await import(
      '../src/models/User.model.js'
    );

    User.findById = jest.fn();

    await getUserProfile(
      buildReq('someuser'),
      buildRes(),
      mockNext
    );

    expect(User.findById).not.toHaveBeenCalled();
  });
});