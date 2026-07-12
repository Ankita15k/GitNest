/**
 * Tests for fix: POST /exchange must use only GETDEL, never a preceding GET 
 *
 * Verifies:
 * 1. redis.get is never called — GETDEL is the single authoritative check.
 * 2. A valid code returns 200 with the JWT token.
 * 3. An expired / consumed code returns 401.
 * 4. Two concurrent requests for the same code: exactly one wins (200),
 *    the other loses (401) — no double-redemption, no silent 401 for
 *    the legitimate first caller.
 * 5. Missing / malformed codes still return 400.
 */
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// ─── Shared mutable Redis store ───────────────────────────────────────────────
let redisStore = new Map();
let mockRedis;

jest.unstable_mockModule('../src/config/redis.js', () => ({
  getRedisClient: jest.fn(() => mockRedis),
}));

// ─── Other dependency mocks ───────────────────────────────────────────────────
jest.unstable_mockModule('../src/utils/generateToken.js', () => ({
  default: jest.fn(() => 'mock.jwt.token'),
}));

jest.unstable_mockModule('../src/utils/responseHandlers.js', () => ({
  sendError: jest.fn((res, { statusCode, message }) => {
    res.status(statusCode).json({ message });
  }),
}));

jest.unstable_mockModule('../src/constants/errorCodes.js', () => ({
  default: { RATE_LIMITED: 'RATE_LIMITED' },
}));

// ─── Dynamic imports (after mocks) ───────────────────────────────────────────
// We import the router and mount it on a minimal express app so we can hit
// the /exchange endpoint via supertest without needing a full app bootstrap.
const { default: express }       = await import('express');
const { default: authGithubRouter } = await import('../src/routes/auth.github.routes.js');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/', authGithubRouter);
  return app;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CODE_PREFIX = 'oauth:code:';
const validCode   = 'a'.repeat(64);   // 64 hex chars

const makeRedis = () => ({
  get:    jest.fn(async (key)        => redisStore.get(key) ?? null),
  getdel: jest.fn(async (key) => {
    // Atomic: return current value and delete in one operation.
    const val = redisStore.get(key) ?? null;
    redisStore.delete(key);
    return val;
  }),
  setex:  jest.fn(async (key, _ttl, val) => { redisStore.set(key, val); }),
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('fix #557 — POST /exchange uses only GETDEL, never a preceding GET', () => {
  let app;

  beforeEach(() => {
    redisStore = new Map();
    mockRedis  = makeRedis();
    jest.clearAllMocks();
    // Re-assign the fresh mock after clearAllMocks clears call history
    mockRedis  = makeRedis();
    app        = buildApp();
  });

  // ── 1. redis.get is never called ─────────────────────────────────────────────
  test('redis.get is never called during a successful exchange', async () => {
    redisStore.set(`${CODE_PREFIX}${validCode}`, 'mock.jwt.token');

    const { default: supertest } = await import('supertest');
    await supertest(app)
      .post('/exchange')
      .send({ code: validCode });

    expect(mockRedis.get).not.toHaveBeenCalled();
    expect(mockRedis.getdel).toHaveBeenCalledTimes(1);
    expect(mockRedis.getdel).toHaveBeenCalledWith(`${CODE_PREFIX}${validCode}`);
  });

  // ── 2. redis.get is never called even when code is absent ────────────────────
  test('redis.get is never called when the code is not in the store', async () => {
    const { default: supertest } = await import('supertest');
    await supertest(app)
      .post('/exchange')
      .send({ code: validCode });

    expect(mockRedis.get).not.toHaveBeenCalled();
    expect(mockRedis.getdel).toHaveBeenCalledTimes(1);
  });

  // ── 3. Valid code → 200 with JWT ──────────────────────────────────────────────
  test('returns 200 and the JWT when GETDEL finds the code', async () => {
    redisStore.set(`${CODE_PREFIX}${validCode}`, 'the.real.jwt');

    const { default: supertest } = await import('supertest');
    const res = await supertest(app)
      .post('/exchange')
      .send({ code: validCode });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('the.real.jwt');
  });

  // ── 4. Code consumed on first call (key deleted) ──────────────────────────────
  test('code is consumed after first successful exchange — second call returns 401', async () => {
    redisStore.set(`${CODE_PREFIX}${validCode}`, 'the.real.jwt');

    const { default: supertest } = await import('supertest');

    const res1 = await supertest(app)
      .post('/exchange')
      .send({ code: validCode });
    expect(res1.status).toBe(200);

    const res2 = await supertest(app)
      .post('/exchange')
      .send({ code: validCode });
    expect(res2.status).toBe(401);
  });

  // ── 5. Expired / absent code → 401 ───────────────────────────────────────────
  test('returns 401 when GETDEL finds nothing (expired or never existed)', async () => {
    // store is empty — simulates TTL expiry
    const { default: supertest } = await import('supertest');
    const res = await supertest(app)
      .post('/exchange')
      .send({ code: validCode });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid or expired/i);
  });

  // ── 6. Concurrency: exactly one of two simultaneous requests wins ─────────────
  test('under concurrent requests for the same code, exactly one gets 200 and the other gets 401', async () => {
    redisStore.set(`${CODE_PREFIX}${validCode}`, 'the.real.jwt');

    // Simulate true GETDEL atomicity: the store is a plain Map, so JS's
    // single-threaded event loop guarantees the two async calls interleave
    // correctly. Both fire before either awaits, so we get the real
    // concurrency behaviour within the Node.js runtime.
    const { default: supertest } = await import('supertest');

    const [res1, res2] = await Promise.all([
      supertest(app).post('/exchange').send({ code: validCode }),
      supertest(app).post('/exchange').send({ code: validCode }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([200, 401]);   // exactly one winner, one loser

    // The winner must have the JWT; the loser must not
    const winner = res1.status === 200 ? res1 : res2;
    const loser  = res1.status === 401 ? res1 : res2;
    expect(winner.body.token).toBe('the.real.jwt');
    expect(loser.body.token).toBeUndefined();

    // GETDEL called twice (once per request), GET called zero times
    expect(mockRedis.getdel).toHaveBeenCalledTimes(2);
    expect(mockRedis.get).not.toHaveBeenCalled();
  });

  // ── 7. Missing code body → 400 ────────────────────────────────────────────────
  test('returns 400 when code is missing from request body', async () => {
    const { default: supertest } = await import('supertest');
    const res = await supertest(app)
      .post('/exchange')
      .send({});

    expect(res.status).toBe(400);
    expect(mockRedis.getdel).not.toHaveBeenCalled();
    expect(mockRedis.get).not.toHaveBeenCalled();
  });

  // ── 8. Malformed code → 400, no Redis call ────────────────────────────────────
  test('returns 400 for a code that fails format validation, without touching Redis', async () => {
    const { default: supertest } = await import('supertest');
    const res = await supertest(app)
      .post('/exchange')
      .send({ code: 'not-a-valid-hex-code' });

    expect(res.status).toBe(400);
    expect(mockRedis.getdel).not.toHaveBeenCalled();
    expect(mockRedis.get).not.toHaveBeenCalled();
  });
});