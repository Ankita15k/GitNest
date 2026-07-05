import { jest, describe, beforeEach, test, expect } from '@jest/globals';

process.env.FRONTEND_URL = 'http://localhost:5173';

// ─── Mocks ────────────────────────────────────────────────────────────────────
let mockAuthenticate = jest.fn();

jest.unstable_mockModule('passport', () => ({
  default: {
    use: jest.fn(),
    initialize: jest.fn(() => (req, res, next) => next()),
    session: jest.fn(() => (req, res, next) => next()),
    authenticate: jest.fn((strategy, options, callback) => {
      return (req, res, next) => {
        mockAuthenticate(strategy, options, callback, req, res, next);
      };
    }),
  },
}));

jest.unstable_mockModule('../src/utils/generateToken.js', () => ({
  default: jest.fn(() => 'mock.jwt.token'),
}));

jest.unstable_mockModule('../src/config/redis.js', () => ({
  getRedisClient: jest.fn(() => null), // Fallback to Map store during tests
}));

// ─── Dynamic Import of Router & Express ───────────────────────────────────────
const { default: express } = await import('express');
const { default: googleAuthRouter } = await import('../src/routes/auth.google.routes.js');
const { default: supertest } = await import('supertest');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/', googleAuthRouter);
  return app;
};

describe('Google OAuth 2.0 Route Tests (Isolated)', () => {
  let app;

  beforeEach(() => {
    mockAuthenticate.mockReset();
    jest.clearAllMocks();
    app = buildApp();
  });

  test('GET /google should initiate passport google authentication', async () => {
    mockAuthenticate.mockImplementation((strategy, options, callback, req, res, next) => {
      res.status(200).json({ status: 'initiated' });
    });

    const res = await supertest(app).get('/google');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('initiated');
    expect(mockAuthenticate).toHaveBeenCalledWith(
      'google',
      expect.objectContaining({ scope: expect.arrayContaining(['profile', 'email']) }),
      undefined,
      expect.any(Object),
      expect.any(Object),
      expect.any(Function)
    );
  });

  test('GET /google/callback with URL query error should redirect to frontend login with error', async () => {
    const res = await supertest(app)
      .get('/google/callback?error=access_denied&error_description=User+denied+consent');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/login?error=User%20denied%20consent');
    expect(mockAuthenticate).not.toHaveBeenCalled();
  });

  test('GET /google/callback on passport authentication error should redirect to login with error', async () => {
    mockAuthenticate.mockImplementation((strategy, options, callback, req, res, next) => {
      // Simulate passport error
      callback(new Error('Google API connection failure'), null);
    });

    const res = await supertest(app).get('/google/callback');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/login?error=Google%20API%20connection%20failure');
  });

  test('GET /google/callback on missing user / info failure should redirect to login with info message', async () => {
    mockAuthenticate.mockImplementation((strategy, options, callback, req, res, next) => {
      // Simulate strategy calling done(null, false, { message: '...' })
      callback(null, false, { message: 'Missing required profile email' });
    });

    const res = await supertest(app).get('/google/callback');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/login?error=Missing%20required%20profile%20email');
  });

  test('GET /google/callback on authentication success should redirect to oauth-success page with a code', async () => {
    mockAuthenticate.mockImplementation((strategy, options, callback, req, res, next) => {
      // Simulate successful strategy verification
      callback(null, { _id: '60c72b2f9b1d8b2d88a1b234' });
    });

    const res = await supertest(app).get('/google/callback');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/oauth-success?code=');
    
    // Check code format matches 64 hex characters
    const url = new URL(res.headers.location);
    const code = url.searchParams.get('code');
    expect(code).toMatch(/^[0-9a-f]{64}$/);
  });
});
