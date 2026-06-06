/**
 * Integration tests for forgot-password endpoint rate limiting (issue #429).
 *
 * Core invariant: the rate limiter must fire on EVERY inbound request to
 * POST /api/v1/auth/forgot-password, regardless of whether the request
 * body passes format validation.  This prevents an attacker from
 * automating requests to flood a victim's inbox with password-reset
 * emails and from exhausting the platform's email service quota.
 *
 * Scenarios covered:
 *   POST /forgot-password
 *   - Returns 200 on the first valid-format request (no 429)
 *   - RateLimit-* headers are present on every response
 *   - RateLimit-Remaining decrements with each request
 *   - Returns 429 after exceeding FORGOT_PWD_RATE_LIMIT_MAX
 *   - 429 response body is JSON with a message field
 *   - Malformed payloads (invalid email) still increment the counter
 *   - Empty body requests still increment the counter
 *
 *   POST /reset-password/:token
 *   - Returns 429 after exceeding RESET_PWD_RATE_LIMIT_MAX
 *   - RateLimit-* headers are present on every response
 *
 *   Independence
 *   - Exhausting the forgot-password limiter does not affect reset-password
 *   - Exhausting the forgot-password limiter does not affect login
 *
 * Test isolation strategy:
 *   express-rate-limit uses an in-memory store by default. Because Jest runs
 *   tests serially (--runInBand), each test suite needs its own app instance
 *   with a freshly constructed limiter so counters don't bleed between tests.
 *   We pass per-test environment variables to override the window and max
 *   before requiring the routes module.
 */

import request from 'supertest';
import express from 'express';

// Override limits to small values for fast test execution.
process.env.LOGIN_RATE_LIMIT_WINDOW_MS = '60000';
process.env.LOGIN_RATE_LIMIT_MAX = '20';
process.env.REGISTER_RATE_LIMIT_WINDOW_MS = '60000';
process.env.REGISTER_RATE_LIMIT_MAX = '20';
process.env.FORGOT_PWD_RATE_LIMIT_WINDOW_MS = '60000';
process.env.FORGOT_PWD_RATE_LIMIT_MAX = '3';
process.env.RESET_PWD_RATE_LIMIT_WINDOW_MS = '60000';
process.env.RESET_PWD_RATE_LIMIT_MAX = '4';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_rate_limit_secret';
process.env.NODE_ENV = 'test';

// ---------------------------------------------------------------------------
// Build a minimal test app that re-creates the auth routes each describe
// block so the in-memory store is fresh for each group of tests.
// ---------------------------------------------------------------------------

const buildTestApp = async () => {
  const cacheBust = `?t=${Date.now()}_${Math.random()}`;
  const { default: authRoutes } = await import(`../src/routes/auth.routes.js${cacheBust}`);

  const app = express();
  app.use(express.json());

  app.use((req, _res, next) => {
    req.requestId = 'test-req-id';
    next();
  });

  app.use('/api/v1/auth', authRoutes);

  // Minimal error handler so validation failures return JSON
  app.use((err, req, res, _next) => {
    res.status(err.statusCode || 500).json({ status: 'error', message: err.message, errors: err.errors });
  });

  return app;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validForgotPassword = { email: 'test@example.com' };
const malformedEmail = { email: 'notanemail' };
const missingAllFields = {};

// ---------------------------------------------------------------------------
// Forgot-password rate limiting
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/forgot-password — rate limiting', () => {
  let app;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  test('returns non-429 on first valid-format request', async () => {
    const res = await request(app).post('/api/v1/auth/forgot-password').send(validForgotPassword);
    expect(res.status).not.toBe(429);
  });

  test('RateLimit-Limit header is present on every response', async () => {
    const res = await request(app).post('/api/v1/auth/forgot-password').send(validForgotPassword);
    expect(res.headers).toHaveProperty('ratelimit-limit');
  });

  test('RateLimit-Remaining header decrements with each request', async () => {
    const r1 = await request(app).post('/api/v1/auth/forgot-password').send(validForgotPassword);
    const r2 = await request(app).post('/api/v1/auth/forgot-password').send(validForgotPassword);
    const rem1 = Number(r1.headers['ratelimit-remaining']);
    const rem2 = Number(r2.headers['ratelimit-remaining']);
    expect(rem2).toBeLessThan(rem1);
  });

  test('returns 429 after exceeding the limit', async () => {
    const max = Number(process.env.FORGOT_PWD_RATE_LIMIT_MAX);
    for (let i = 0; i < max + 3; i++) {
      await request(app).post('/api/v1/auth/forgot-password').send(validForgotPassword);
    }
    const finalRes = await request(app).post('/api/v1/auth/forgot-password').send(validForgotPassword);
    expect(finalRes.status).toBe(429);
  });

  test('429 response body is JSON with a message field', async () => {
    const res = await request(app).post('/api/v1/auth/forgot-password').send(validForgotPassword);
    expect(res.status).toBe(429);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('message');
  });
});

// ---------------------------------------------------------------------------
// Limiter counts malformed requests (ordering guarantee)
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/forgot-password — limiter counts malformed payloads', () => {
  let app;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  test('malformed email increments the counter (RateLimit-Remaining decreases)', async () => {
    const r1 = await request(app).post('/api/v1/auth/forgot-password').send(malformedEmail);
    const r2 = await request(app).post('/api/v1/auth/forgot-password').send(malformedEmail);

    expect(r1.status).toBe(400);
    expect(r2.status).toBe(400);

    const rem1 = Number(r1.headers['ratelimit-remaining']);
    const rem2 = Number(r2.headers['ratelimit-remaining']);
    expect(rem2).toBeLessThan(rem1);
  });

  test('empty body request increments the counter', async () => {
    const r1 = await request(app).post('/api/v1/auth/forgot-password').send(missingAllFields);
    const r2 = await request(app).post('/api/v1/auth/forgot-password').send(missingAllFields);

    const rem1 = Number(r1.headers['ratelimit-remaining']);
    const rem2 = Number(r2.headers['ratelimit-remaining']);
    expect(rem2).toBeLessThan(rem1);
  });

  test('exhausting the limit with malformed payloads then returns 429', async () => {
    const max = Number(process.env.FORGOT_PWD_RATE_LIMIT_MAX);
    for (let i = 0; i < max + 3; i++) {
      await request(app).post('/api/v1/auth/forgot-password').send(malformedEmail);
    }
    const validAfterExhaustion = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send(validForgotPassword);
    expect(validAfterExhaustion.status).toBe(429);
  });

  test('RateLimit-Remaining header is present even on validation-failure responses', async () => {
    const res = await request(app).post('/api/v1/auth/forgot-password').send(malformedEmail);
    expect(res.headers).toHaveProperty('ratelimit-remaining');
  });
});

// ---------------------------------------------------------------------------
// Reset-password rate limiting
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/reset-password/:token — rate limiting', () => {
  let app;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  test('RateLimit-Limit header is present on response', async () => {
    const res = await request(app).post('/api/v1/auth/reset-password/faketoken123').send({ password: 'NewPass123' });
    expect(res.headers).toHaveProperty('ratelimit-limit');
  });

  test('returns 429 after exceeding the limit', async () => {
    const max = Number(process.env.RESET_PWD_RATE_LIMIT_MAX);
    for (let i = 0; i < max + 3; i++) {
      await request(app).post('/api/v1/auth/reset-password/faketoken123').send({ password: 'NewPass123' });
    }
    const finalRes = await request(app).post('/api/v1/auth/reset-password/faketoken123').send({ password: 'NewPass123' });
    expect(finalRes.status).toBe(429);
  });

  test('429 body has a message field', async () => {
    const res = await request(app).post('/api/v1/auth/reset-password/faketoken123').send({ password: 'NewPass123' });
    expect(res.status).toBe(429);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// Independence: forgot-password and other auth limiters are separate
// ---------------------------------------------------------------------------

describe('forgot-password has independent rate limit counters', () => {
  let app;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  test('exhausting the forgot-password limit does not affect login', async () => {
    const fpMax = Number(process.env.FORGOT_PWD_RATE_LIMIT_MAX);
    for (let i = 0; i < fpMax + 3; i++) {
      await request(app).post('/api/v1/auth/forgot-password').send(validForgotPassword);
    }
    // Forgot-password must now be blocked
    const fpRes = await request(app).post('/api/v1/auth/forgot-password').send(validForgotPassword);
    expect(fpRes.status).toBe(429);

    // Login counter must still have headroom
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'Password123' });
    expect(loginRes.status).not.toBe(429);
  });

  test('exhausting the forgot-password limit does not affect reset-password', async () => {
    const fpMax = Number(process.env.FORGOT_PWD_RATE_LIMIT_MAX);
    for (let i = 0; i < fpMax + 3; i++) {
      await request(app).post('/api/v1/auth/forgot-password').send(validForgotPassword);
    }
    const fpRes = await request(app).post('/api/v1/auth/forgot-password').send(validForgotPassword);
    expect(fpRes.status).toBe(429);

    // Reset-password counter must still have headroom
    const resetRes = await request(app)
      .post('/api/v1/auth/reset-password/faketoken123')
      .send({ password: 'NewPass123' });
    expect(resetRes.status).not.toBe(429);
  });
});
