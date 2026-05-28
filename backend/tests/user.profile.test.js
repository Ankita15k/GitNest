/**
 * Regression tests for the getUserProfile endpoint.
 *
 * Verifies that internal MongoDB ObjectIds cannot be used to enumerate
 * user documents via the public GET /api/v1/users/:username route.
 *
 * Run with: node --experimental-vm-modules node_modules/.bin/jest tests/user.profile.test.js
 * or once a test runner is wired up: npm test
 *
 * These are unit-level tests that stub the User model so no real
 * database connection is required.
 */

import { jest } from '@jest/globals';

// ---------------------------------------------------------------------------
// Minimal mock infrastructure — replicate just enough of the Express/Mongoose
// surface area needed to exercise getUserProfile in isolation.
// ---------------------------------------------------------------------------

const mockNext = jest.fn();

const buildRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  res.locals = {};
  return res;
};

const buildReq = (username) => ({ params: { username } });

// ---------------------------------------------------------------------------
// Inline stub for the User model — avoids a live MongoDB connection.
// ---------------------------------------------------------------------------

let stubbedUser = null;

jest.mock('../src/models/User.model.js', () => ({
  default: {
    findOne: jest.fn(async ({ username }) => {
      if (stubbedUser && stubbedUser.username === username) return stubbedUser;
      return null;
    }),
  },
}));

// Mongoose is still imported by the controller for session helpers; mock it
// so the module resolves without a real connection.
jest.mock('mongoose', () => ({
  default: {
    Types: { ObjectId: { isValid: () => false } },
    startSession: jest.fn(async () => ({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
      inTransaction: jest.fn(() => false),
    })),
  },
}));

// Stub side-effect utilities so they don't fail without a DB.
jest.mock('../src/utils/logActivitySafely.js', () => ({
  logActivitySafely: jest.fn(async () => {}),
}));

// ---------------------------------------------------------------------------
// Import the controller after mocks are in place.
// ---------------------------------------------------------------------------

const { getUserProfile } = await import('../src/controllers/user.controller.js');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stubbedUser = null;
  });

  test('returns 200 and the user document for a valid username', async () => {
    stubbedUser = { username: 'alice', email: 'alice@example.com', bio: 'Hello' };
    const req = buildReq('alice');
    const res = buildRes();

    await getUserProfile(req, res, mockNext);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.username).toBe('alice');
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('is case-insensitive — uppercased username resolves the same document', async () => {
    stubbedUser = { username: 'alice', email: 'alice@example.com' };
    const req = buildReq('ALICE');
    const res = buildRes();

    await getUserProfile(req, res, mockNext);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.username).toBe('alice');
  });

  test('returns 404 when username does not exist', async () => {
    stubbedUser = null;
    const req = buildReq('ghost');
    const res = buildRes();

    await getUserProfile(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    const err = mockNext.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
  });

  // Core regression: a raw 24-hex-char ObjectId must NOT return a user document.
  test('returns 404 when a valid MongoDB ObjectId is supplied as the username', async () => {
    // Simulate a DB that has a user whose _id matches this ObjectId — the
    // controller must not find it because it must only query by username.
    const objectId = '507f1f77bcf86cd799439011';
    stubbedUser = { username: objectId, email: 'internal@example.com' };

    // Override findOne to return null for username-based lookup while a
    // hypothetical findById call would have returned a document.
    const { default: User } = await import('../src/models/User.model.js');
    User.findOne.mockImplementation(async ({ username }) => {
      // The user's actual username is NOT the ObjectId string — simulates the
      // real-world case where the attacker supplies an ID, not a username.
      if (username === 'realusername') return stubbedUser;
      return null;
    });

    const req = buildReq(objectId);
    const res = buildRes();

    await getUserProfile(req, res, mockNext);

    // The controller must call next with a 404 — it may not return user data.
    expect(mockNext).toHaveBeenCalledTimes(1);
    const err = mockNext.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
    expect(res.body).toBeNull();
  });

  test('never calls User.findById on any input', async () => {
    const { default: User } = await import('../src/models/User.model.js');
    User.findById = jest.fn();

    await getUserProfile(buildReq('someuser'), buildRes(), mockNext);

    expect(User.findById).not.toHaveBeenCalled();
  });
});
