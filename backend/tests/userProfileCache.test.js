import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

// ─── mock helpers ────────────────────────────────────────────────────────────

const makeId = (id = 'user-id') => ({
  toString: () => id,
  equals: jest.fn((other) => String(other) === id),
});

const makeUser = (overrides = {}) => {
  const id = overrides.id ?? 'user-id';
  return {
    _id: makeId(id),
    id,
    username: overrides.username ?? 'currentuser',
    email: 'test@test.com',
    bio: overrides.bio ?? 'original bio',
    location: overrides.location ?? '',
    website: overrides.website ?? '',
    avatarUrl: overrides.avatarUrl ?? '',
    displayName: overrides.displayName ?? '',
    company: overrides.company ?? '',
    twitterHandle: overrides.twitterHandle ?? '',
    followers: overrides.followers ?? [],
    following: overrides.following ?? [],
    equals: jest.fn((other) => String(other) === id),
    save: overrides.save ?? jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
};

// ─── mocks ───────────────────────────────────────────────────────────────────

const mockRedisGet = jest.fn();
const mockRedisDel = jest.fn().mockResolvedValue(1);
const mockRedisSet = jest.fn().mockResolvedValue('OK');
const mockRedisClient = {
  get: mockRedisGet,
  set: mockRedisSet,
  del: mockRedisDel,
};

const mockUserFindOne  = jest.fn();
const mockUserFindById = jest.fn();
const mockUserUpdateOne = jest.fn();
const mockVerify = jest.fn(() => ({ id: 'user-id' }));

jest.unstable_mockModule('../src/config/redis.js', () => ({
  getRedisClient: () => mockRedisClient,
  default: jest.fn().mockResolvedValue(mockRedisClient),
}));

jest.unstable_mockModule('../src/models/User.model.js', () => ({
  default: {
    findOne:  mockUserFindOne,
    findById: mockUserFindById,
    updateOne: mockUserUpdateOne,
  },
}));

jest.unstable_mockModule('../src/models/Repository.model.js', () => ({
  default: {
    findOne:  jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create:   jest.fn(),
    updateOne: jest.fn(),
  },
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign:   jest.fn(() => 'signed.jwt.token'),
    verify: mockVerify,
  },
}));

const setupSessionMock = () => {
  const session = {
    startTransaction:  jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(),
    abortTransaction:  jest.fn().mockResolvedValue(),
    endSession:        jest.fn(),
    inTransaction:     jest.fn(() => true),
  };
  jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
  return session;
};

// ─── app ─────────────────────────────────────────────────────────────────────

const { default: createApp } = await import('../src/app.js');
const app = createApp();
const AUTH = 'Bearer valid-token';

// ─── tests ───────────────────────────────────────────────────────────────────

describe('user profile cache invalidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserFindById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(makeUser()),
    }));
  });

  // ── updateProfile ──────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    test('deletes username-keyed and objectId-keyed cache entries after save', async () => {
      const user = makeUser({ bio: 'updated bio' });
      mockUserFindById
        .mockResolvedValueOnce(user)          // protect middleware
        .mockImplementation(() => ({
          select: jest.fn().mockResolvedValue(makeUser()),
        }));

      const res = await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', AUTH)
        .send({ bio: 'updated bio' });

      expect(res.status).toBe(200);
      expect(mockRedisDel).toHaveBeenCalledWith('user:profile:currentuser');
      expect(mockRedisDel).toHaveBeenCalledWith('user:profile:user-id');
    });

    test('does not call redis.del when Redis is unavailable', async () => {
      // Re-mock getRedisClient to return null for this test only
      const redisMod = await import('../src/config/redis.js');
      const spy = jest.spyOn(redisMod, 'getRedisClient').mockReturnValueOnce(null);

      const user = makeUser({ bio: 'new bio' });
      mockUserFindById.mockResolvedValueOnce(user).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(makeUser()),
      }));

      const res = await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', AUTH)
        .send({ bio: 'new bio' });

      expect(res.status).toBe(200);
      expect(mockRedisDel).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    test('serves fresh profile immediately after update — no stale cache hit', async () => {
      // First request: cache miss → populate cache
      mockRedisGet.mockResolvedValueOnce(null);
      mockUserFindOne.mockResolvedValueOnce(makeUser({ bio: 'old bio' }));

      await request(app)
        .get('/api/v1/users/currentuser')
        .set('Authorization', AUTH);

      expect(mockRedisSet).toHaveBeenCalledWith(
        'user:profile:currentuser',
        expect.any(String),
        'EX',
        60,
      );

      // Update triggers cache eviction
      const updatedUser = makeUser({ bio: 'new bio' });
      mockUserFindById.mockResolvedValueOnce(updatedUser);

      await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', AUTH)
        .send({ bio: 'new bio' });

      expect(mockRedisDel).toHaveBeenCalledWith('user:profile:currentuser');

      // Next GET must not serve the old cached value
      mockRedisGet.mockResolvedValueOnce(null); // evicted — cache miss
      mockUserFindOne.mockResolvedValueOnce(makeUser({ bio: 'new bio' }));

      const res = await request(app)
        .get('/api/v1/users/currentuser')
        .set('Authorization', AUTH);

      expect(res.status).toBe(200);
      expect(res.body.data.bio).toBe('new bio');
    });

    test('activity logging failure does not cause updateProfile to return 500', async () => {
      const { logActivity } = await import('../src/services/activity.service.js');
      logActivity.mockRejectedValueOnce(new Error('activity DB down'));

      const user = makeUser({ bio: 'another bio' });
      mockUserFindById.mockResolvedValueOnce(user).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(makeUser()),
      }));

      const res = await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', AUTH)
        .send({ bio: 'another bio' });

      expect(res.status).toBe(200);
    });
  });

  // ── getUserProfile cache key ───────────────────────────────────────────────

  describe('getUserProfile cache key generation', () => {
    test('uses lowercase username cache key for mixed-case username route params (Redis GET + SET)', async () => {
      // Mixed-case route param: /currentUser should map to user:profile:currentuser
      mockRedisGet.mockResolvedValueOnce(null);

      mockUserFindOne.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue(
          makeUser({
            username: 'currentuser',
          }),
        ),
      });

      const res = await request(app)
        .get('/api/v1/users/CurrentUser')
        .set('Authorization', AUTH);

      expect(res.status).toBe(200);

      expect(mockRedisGet).toHaveBeenCalledWith('user:profile:currentuser');
      expect(mockRedisSet).toHaveBeenCalledWith(
        'user:profile:currentuser',
        expect.any(String),
        'EX',
        60,
      );
    });
  });

  // ── followUser ─────────────────────────────────────────────────────────────

  describe('followUser cache eviction', () => {
    test('evicts cache for both actor and target after successful follow', async () => {
      setupSessionMock();

      const target = makeUser({
        id: 'target-id',
        username: 'targetuser',
        followers: [],
        following: [],
      });
      mockUserFindOne.mockResolvedValue(target);
      mockUserUpdateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

      const res = await request(app)
        .post('/api/v1/users/targetuser/follow')
        .set('Authorization', AUTH);

      expect(res.status).toBe(200);

      // Actor evictions
      expect(mockRedisDel).toHaveBeenCalledWith('user:profile:currentuser');
      expect(mockRedisDel).toHaveBeenCalledWith('user:profile:user-id');
      // Target evictions
      expect(mockRedisDel).toHaveBeenCalledWith('user:profile:targetuser');
      expect(mockRedisDel).toHaveBeenCalledWith('user:profile:target-id');
    });

    test('does not evict cache when follow saga fails', async () => {
      setupSessionMock();

      const target = makeUser({ id: 'target-id', username: 'targetuser' });
      mockUserFindOne.mockResolvedValue(target);
      mockUserUpdateOne.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .post('/api/v1/users/targetuser/follow')
        .set('Authorization', AUTH);

      expect(res.status).toBe(500);
      expect(mockRedisDel).not.toHaveBeenCalled();
    });
  });

  // ── unfollowUser ───────────────────────────────────────────────────────────

  describe('unfollowUser cache eviction', () => {
    test('evicts cache for both actor and target after successful unfollow', async () => {
      setupSessionMock();

      const target = makeUser({
        id: 'target-id',
        username: 'targetuser',
        followers: ['user-id'],
      });
      mockUserFindOne.mockResolvedValue(target);
      mockUserUpdateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

      const res = await request(app)
        .post('/api/v1/users/targetuser/unfollow')
        .set('Authorization', AUTH);

      expect(res.status).toBe(200);

      expect(mockRedisDel).toHaveBeenCalledWith('user:profile:currentuser');
      expect(mockRedisDel).toHaveBeenCalledWith('user:profile:user-id');
      expect(mockRedisDel).toHaveBeenCalledWith('user:profile:targetuser');
      expect(mockRedisDel).toHaveBeenCalledWith('user:profile:target-id');
    });

    test('does not evict cache when unfollow saga fails', async () => {
      setupSessionMock();

      const target = makeUser({ id: 'target-id', username: 'targetuser' });
      mockUserFindOne.mockResolvedValue(target);
      mockUserUpdateOne.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .post('/api/v1/users/targetuser/unfollow')
        .set('Authorization', AUTH);

      expect(res.status).toBe(500);
      expect(mockRedisDel).not.toHaveBeenCalled();
    });
  });
});