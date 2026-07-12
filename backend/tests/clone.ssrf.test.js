import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import request from 'supertest';

process.env.JWT_SECRET = 'test_jwt_secret_clone';
process.env.NODE_ENV   = 'test';

// ─── mock handles ──────────────────────────────────────────────────────────

const mockGitClone     = jest.fn().mockResolvedValue(undefined);
const mockRepoFindOne  = jest.fn();
const mockRepoCreate   = jest.fn();
const mockFsExistsSync = jest.fn(() => false);
const mockFsMkdirSync  = jest.fn();
const mockFsRmSync     = jest.fn();
const mockDnsLookup    = jest.fn();
const mockVerify       = jest.fn(() => ({ id: 'user-id' }));

// ─── module mocks ──────────────────────────────────────────────────────────

jest.unstable_mockModule('simple-git', () => ({
  default: jest.fn(() => ({ clone: mockGitClone })),
}));

jest.unstable_mockModule('fs', () => ({
  default: {
    mkdirSync:  mockFsMkdirSync,
    existsSync: mockFsExistsSync,
    rmSync:     mockFsRmSync,
  },
  mkdirSync:  mockFsMkdirSync,
  existsSync: mockFsExistsSync,
  rmSync:     mockFsRmSync,
}));

jest.unstable_mockModule('dns', () => ({
  default:  { promises: { lookup: mockDnsLookup } },
  promises: { lookup: mockDnsLookup },
}));

jest.unstable_mockModule('../src/models/Repository.model.js', () => ({
  default: {
    findOne: mockRepoFindOne,
    create:  mockRepoCreate,
  },
}));

jest.unstable_mockModule('../src/models/User.model.js', () => ({
  default: { findById: jest.fn(), findOne: jest.fn() },
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign:   jest.fn(() => 'signed.jwt.token'),
    verify: mockVerify,
  },
}));

// ─── app ──────────────────────────────────────────────────────────────────

const { default: createApp } = await import('../src/app.js');
const app = createApp();
const AUTH = 'Bearer valid-token';

// ─── helpers ──────────────────────────────────────────────────────────────

const cloneRequest = (repositoryUrl) =>
  request(app)
    .post('/api/v1/repositories/clone')
    .set('Authorization', AUTH)
    .send({ repositoryUrl });

const validExternalUrl = 'https://github.com/owner/my-repo.git';

// Make DNS resolve to a safe public IP for valid-URL tests
const allowDns = () =>
  mockDnsLookup.mockResolvedValue({ address: '140.82.112.4', family: 4 });

// ─── tests ────────────────────────────────────────────────────────────────

describe('cloneExternalRepository — SSRF prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepoFindOne.mockResolvedValue(null);  // no duplicate by default
    mockRepoCreate.mockResolvedValue({
      _id: 'repo-id', name: 'my-repo', owner: 'user-id',
    });
    mockFsExistsSync.mockReturnValue(false);
  });

  // ── blocked IP literals ────────────────────────────────────────────────

  const internalUrls = [
    ['loopback IPv4',           'https://127.0.0.1/owner/repo'],
    ['loopback named',          'https://localhost/owner/repo'],
    ['RFC-1918 10.x',           'https://10.0.0.1/owner/repo'],
    ['RFC-1918 172.16.x',       'https://172.16.0.1/owner/repo'],
    ['RFC-1918 172.31.x',       'https://172.31.255.254/owner/repo'],
    ['RFC-1918 192.168.x',      'https://192.168.1.1/owner/repo'],
    ['link-local / AWS metadata','https://169.254.169.254/latest/meta-data/.git'],
    ['GCP metadata',            'https://169.254.169.254/computeMetadata/v1/.git'],
    ['multicast',               'https://224.0.0.1/owner/repo'],
  ];

  test.each(internalUrls)(
    'rejects %s before git.clone is called',
    async (_label, url) => {
      // DNS mock should not even be reached for bare IP literals,
      // but provide a safe fallback just in case
      mockDnsLookup.mockResolvedValue({ address: '127.0.0.1', family: 4 });

      const res = await cloneRequest(url);

      expect(res.status).toBe(400);
      expect(mockGitClone).not.toHaveBeenCalled();
    }
  );

  // ── DNS-resolved internal address ──────────────────────────────────────

  test('rejects hostname that resolves to a private IP (DNS rebinding)', async () => {
    // Hostname looks external but resolves to an RFC-1918 address
    mockDnsLookup.mockResolvedValue({ address: '10.0.0.1', family: 4 });

    const res = await cloneRequest('https://evil.example.com/owner/repo.git');

    expect(res.status).toBe(400);
    expect(mockGitClone).not.toHaveBeenCalled();
  });

  test('rejects hostname that resolves to loopback', async () => {
    mockDnsLookup.mockResolvedValue({ address: '127.0.0.1', family: 4 });

    const res = await cloneRequest('https://internal.corp.com/owner/repo.git');

    expect(res.status).toBe(400);
    expect(mockGitClone).not.toHaveBeenCalled();
  });

  test('rejects when DNS lookup fails (unresolvable hostname)', async () => {
    mockDnsLookup.mockRejectedValue(new Error('ENOTFOUND'));

    const res = await cloneRequest('https://nonexistent.invalid/owner/repo.git');

    expect(res.status).toBe(400);
    expect(mockGitClone).not.toHaveBeenCalled();
  });

  // ── valid external URL ────────────────────────────────────────────────

  test('allows a URL whose hostname resolves to a public IP', async () => {
    allowDns();

    const res = await cloneRequest(validExternalUrl);

    expect(mockGitClone).toHaveBeenCalled();
    expect(res.status).toBe(201);
  });

  // ── invalid URL structure ──────────────────────────────────────────────

  test('rejects malformed URL that fails regex before DNS is checked', async () => {
    const res = await cloneRequest('not-a-url');

    expect(res.status).toBe(400);
    expect(mockDnsLookup).not.toHaveBeenCalled();
    expect(mockGitClone).not.toHaveBeenCalled();
  });
});

describe('cloneExternalRepository — TOCTOU duplicate prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    allowDns();
    mockFsExistsSync.mockReturnValue(false);
  });

  test('duplicate check runs before git.clone — no disk write when repo already exists', async () => {
    mockRepoFindOne.mockResolvedValue({
      _id: 'existing-id',
      name: 'my-repo',
      owner: 'user-id',
    });

    const res = await cloneRequest(validExternalUrl);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
    // git.clone must NOT have been called — no orphaned directory
    expect(mockGitClone).not.toHaveBeenCalled();
  });

  test('creates repository when no duplicate exists', async () => {
    mockRepoFindOne.mockResolvedValue(null);
    mockRepoCreate.mockResolvedValue({
      _id: 'new-repo-id',
      name: 'my-repo',
      owner: 'user-id',
    });

    const res = await cloneRequest(validExternalUrl);

    expect(mockGitClone).toHaveBeenCalledTimes(1);
    expect(mockRepoCreate).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(201);
  });

  test('cleans up cloned directory when MongoDB create throws E11000 (concurrent race)', async () => {
    mockRepoFindOne.mockResolvedValue(null);   // both concurrent requests pass findOne
    mockFsExistsSync.mockReturnValue(true);    // directory was written to disk

    const duplicateKeyError = Object.assign(new Error('duplicate key'), { code: 11000 });
    mockRepoCreate.mockRejectedValue(duplicateKeyError);

    const res = await cloneRequest(validExternalUrl);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
    // Orphaned directory must be removed
    expect(mockFsRmSync).toHaveBeenCalledWith(
      expect.stringContaining('my-repo'),
      expect.objectContaining({ recursive: true, force: true }),
    );
  });

  test('cleans up cloned directory on generic MongoDB create failure', async () => {
    mockRepoFindOne.mockResolvedValue(null);
    mockFsExistsSync.mockReturnValue(true);
    mockRepoCreate.mockRejectedValue(new Error('DB connection lost'));

    const res = await cloneRequest(validExternalUrl);

    expect(res.status).toBe(500);
    expect(mockFsRmSync).toHaveBeenCalled();
  });

  test('returns 400 when repositoryUrl is missing', async () => {
    const res = await request(app)
      .post('/api/v1/repositories/clone')
      .set('Authorization', AUTH)
      .send({});

    expect(res.status).toBe(400);
    expect(mockGitClone).not.toHaveBeenCalled();
  });

  test('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/v1/repositories/clone')
      .send({ repositoryUrl: validExternalUrl });

    expect(res.status).toBe(401);
    expect(mockGitClone).not.toHaveBeenCalled();
  });
});