/**
 * Integration tests for response compression middleware.
 *
 * Verifies that the Express app sends gzip-compressed responses when the
 * client advertises Accept-Encoding: gzip, and that the Content-Encoding
 * header is absent for payloads below the 1 KB threshold.
 */

import { jest } from '@jest/globals';
import http from 'http';
import { gunzipSync } from 'zlib';

jest.unstable_mockModule('../src/config/db.js', () => ({ default: jest.fn() }));

process.env.JWT_SECRET = 'test-secret-for-compression-tests';

const { default: express } = await import('express');
const { default: compression } = await import('compression');

const buildTestApp = () => {
  const app = express();
  app.use(compression({ threshold: 1024 }));
  app.use(express.json());

  app.get('/large', (_req, res) => {
    const payload = { items: Array.from({ length: 100 }, (_, i) => ({ id: i, value: `item-${i}-data` })) };
    res.json(payload);
  });

  app.get('/small', (_req, res) => {
    res.json({ ok: true });
  });

  return app;
};

const request = (server, path, headers = {}) =>
  new Promise((resolve, reject) => {
    const addr = server.address();
    const options = { hostname: '127.0.0.1', port: addr.port, path, headers };
    http.get(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });

let server;

beforeAll((done) => {
  server = buildTestApp().listen(0, '127.0.0.1', done);
});

afterAll((done) => {
  server.close(done);
});

describe('compression middleware', () => {
  test('sets Content-Encoding: gzip on large responses when client sends Accept-Encoding: gzip', async () => {
    const res = await request(server, '/large', { 'Accept-Encoding': 'gzip' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-encoding']).toBe('gzip');
  });

  test('large response body is valid gzip data', async () => {
    const res = await request(server, '/large', { 'Accept-Encoding': 'gzip' });
    expect(() => gunzipSync(res.body)).not.toThrow();
  });

  test('does NOT compress when client does not send Accept-Encoding', async () => {
    const res = await request(server, '/large');
    expect(res.headers['content-encoding']).toBeUndefined();
  });

  test('does NOT compress payloads below the 1 KB threshold', async () => {
    const res = await request(server, '/small', { 'Accept-Encoding': 'gzip' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-encoding']).toBeUndefined();
  });

  test('compressed response decodes to valid JSON', async () => {
    const res = await request(server, '/large', { 'Accept-Encoding': 'gzip' });
    const decompressed = gunzipSync(res.body).toString('utf8');
    const parsed = JSON.parse(decompressed);
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(parsed.items).toHaveLength(100);
  });

  test('compression reduces large response size by at least 50%', async () => {
    const [compressed, uncompressed] = await Promise.all([
      request(server, '/large', { 'Accept-Encoding': 'gzip' }),
      request(server, '/large'),
    ]);
    expect(compressed.body.length).toBeLessThan(uncompressed.body.length * 0.5);
  });
});
