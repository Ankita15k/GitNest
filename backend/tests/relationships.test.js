import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const makeObjectId = (id) => ({
  toString: () => id,
  equals: jest.fn(function (other) {
    return String(this) === String(other);
  }),
});

const makeMongoDoc = (overrides = {}) => {
  const targetId = overrides._id ? String(overrides._id) : 'user-id';
  return {
    _id: makeObjectId(targetId),
    id: targetId,
    username: 'currentuser',
    email: 'current@test.com',
    followers: [],
    following: [],
    equals: jest.fn(function (otherId) {
      return String(this._id) === String(otherId);
    }),
    ...overrides,
    _id: makeObjectId(targetId),
    id: targetId,
  };
};

const mockUserFindOne = jest.fn();
const mockUserUpdateOne = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn();
const mockUserFindById = jest.fn(() => ({
  select: jest.fn().mockResolvedValue(makeMongoDoc()),
}));
const mockRepoFindOne = jest.fn();
const mockRepoUpdateOne = jest.fn();
const mockRepoFindById = jest.fn();
const mockRepoFindByIdAndUpdate = jest.fn();
const mockRepoCreate = jest.fn();
const mockSign = jest.fn(() => 'signed.jwt.token');
const mockVerify = jest.fn(() => ({ id: 'user-id' }));

jest.unstable_mockModule('../src/models/User.model.js', () => ({
  default: {
    findOne: mockUserFindOne,
    updateOne: mockUserUpdateOne,
    findByIdAndUpdate: mockUserFindByIdAndUpdate,
    findById: mockUserFindById,
  },
}));

jest.unstable_mockModule('../src/models/Repository.model.js', () => ({
  default: {
    findOne: mockRepoFindOne,
    updateOne: mockRepoUpdateOne,
    findById: mockRepoFindById,
    findByIdAndUpdate: mockRepoFindByIdAndUpdate,
    create: mockRepoCreate,
  },
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: mockSign,
    verify: mockVerify,
  },
}));

const { default: createApp } = await import('../src/app.js');
const app = createApp();

const setupSessionMock = () => {
  const session = {
    startTransaction: jest.fn().mockImplementation(function () { return this; }),
    commitTransaction: jest.fn().mockResolvedValue(),
    abortTransaction: jest.fn().mockResolvedValue(),
    endSession: jest.fn(),
    inTransaction: jest.fn(() => true),
  };
  jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
  return session;
};

describe('relationship mutations - atomicity fixes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserFindById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(makeMongoDoc()),
    }));
  });

  describe('followUser', () => {
    test('follows a user successfully within a transaction', async () => {
      const session = setupSessionMock();

      mockUserFindOne.mockResolvedValue(makeMongoDoc({
        _id: 'target-id',
        id: 'target-id',
        username: 'targetuser',
        followers: [],
        following: [],
      }));
      mockUserUpdateOne.mockResolvedValue({ modifiedCount: 1, acknowledged: true });
      mockUserFindByIdAndUpdate.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/users/targetuser/follow')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Followed successfully');
      expect(session.commitTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });

    test('follow uses $addToSet for idempotency', async () => {
      setupSessionMock();

      mockUserFindOne.mockResolvedValue(makeMongoDoc({
        _id: 'target-id',
        id: 'target-id',
        username: 'targetuser',
      }));
      mockUserUpdateOne.mockResolvedValue({ modifiedCount: 1, acknowledged: true });
      mockUserFindByIdAndUpdate.mockResolvedValue({});

      await request(app)
        .post('/api/v1/users/targetuser/follow')
        .set('Authorization', 'Bearer valid-token');

      expect(mockUserUpdateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: expect.objectContaining({ toString: expect.any(Function) }),
          followers: { $ne: expect.anything() },
        }),
        { $addToSet: { followers: expect.anything() } },
        expect.objectContaining({ session: expect.any(Object) })
      );
      expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ toString: expect.any(Function) }),
        { $addToSet: { following: expect.anything() } },
        expect.objectContaining({ session: expect.any(Object) })
      );
    });

    test('rejects following self', async () => {
      mockUserFindOne.mockResolvedValue(makeMongoDoc());

      const res = await request(app)
        .post('/api/v1/users/currentuser/follow')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('You cannot follow yourself');
    });

    test('rejects following non-existent user', async () => {
      mockUserFindOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/users/nonexistent/follow')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(404);
    });

    test('aborts transaction on database failure', async () => {
      const session = setupSessionMock();

      mockUserFindOne.mockResolvedValue(makeMongoDoc({
        _id: 'target-id',
        id: 'target-id',
        username: 'targetuser',
      }));
      mockUserUpdateOne.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .post('/api/v1/users/targetuser/follow')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(500);
      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });

    test('returns 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/v1/repos/owner/nonexistent/star')

      expect(res.status).toBe(401);
    });

    test('rejects star on missing repository', async () => {
      mockRepoFindOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/repos/owner/nonexistent/star')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(404);
    });
  });

  describe('forkRepository', () => {
    test('creates fork atomically within a transaction', async () => {
      const session = setupSessionMock();

      mockRepoFindOne.mockResolvedValueOnce({
        _id: 'original-id',
        name: 'test-repo',
        owner: 'other-user-id',
        description: 'Test repo',
        language: 'JavaScript',
        topics: ['web'],
        defaultBranch: 'main',
        forks: [],
      });
      mockRepoFindOne.mockResolvedValueOnce(null);
      mockRepoCreate.mockResolvedValue([{
        _id: 'fork-id',
        name: 'test-repo',
        owner: 'user-id',
      }]);
      mockRepoFindByIdAndUpdate.mockResolvedValue({
        _id: 'original-id',
        forks: ['fork-id'],
      });

      const res = await request(app)
        .post('/api/v1/repos/owner/test-repo/fork')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(201);
      expect(session.commitTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });

    test('rejects forking own repository', async () => {
      mockRepoFindOne.mockResolvedValue({
        _id: 'own-repo-id',
        name: 'my-repo',
        owner: 'user-id',
      });

      const res = await request(app)
        .post('/api/v1/repos/currentuser/my-repo/fork')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('You cannot fork your own repository');
    });

    test('rejects duplicate fork', async () => {
      mockRepoFindOne.mockResolvedValueOnce({
        _id: 'original-id',
        name: 'test-repo',
        owner: 'other-user-id',
      });
      mockRepoFindOne.mockResolvedValueOnce({
        _id: 'existing-fork-id',
        name: 'test-repo',
        owner: 'user-id',
        forkedFrom: 'original-id',
      });

      const res = await request(app)
        .post('/api/v1/repos/other/test-repo/fork')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(400);
      expect(mockRepoCreate).not.toHaveBeenCalled();
    });

    test('aborts fork transaction on failure', async () => {
      const session = setupSessionMock();

      mockRepoFindOne.mockResolvedValueOnce({
        _id: 'original-id',
        name: 'test-repo',
        owner: 'other-user-id',
        description: 'Test repo',
        language: 'JavaScript',
        topics: ['web'],
        defaultBranch: 'main',
        forks: [],
      });
      mockRepoFindOne.mockResolvedValueOnce(null);
      mockRepoCreate.mockResolvedValue([{
        _id: 'fork-id',
        name: 'test-repo',
      }]);
      mockRepoFindByIdAndUpdate.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .post('/api/v1/repos/owner/test-repo/fork')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(500);
      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });
  });
});