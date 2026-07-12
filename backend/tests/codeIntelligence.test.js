import request from 'supertest';
import fs from 'fs';
import path from 'path';
import DependencyGraph from '../src/models/DependencyGraph.model.js';
import IndexedSymbol from '../src/models/IndexedSymbol.model.js';
import SagaState from '../src/models/SagaState.model.js';
import { extractDependencyEdgesFromFiles } from '../src/services/dependencyGraphBuilder.service.js';
import { ImpactAnalysis } from '../src/services/impactAnalysis.service.js';
import { extractSymbolsFromContent } from '../src/services/symbolExtractor.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'test-client';
process.env.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'test-secret';
process.env.GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost/auth/github/callback';

const { default: app } = await import('../src/app.js');

describe('Repository Code Intelligence', () => {
  let token;
  let userId;
  let symbolId;
  const username = 'indexowner';
  const repoName = 'indexed-repo';

  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send({
      username,
      email: 'indexowner@gitnest.com',
      password: 'Password123',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'indexowner@gitnest.com', password: 'Password123' });

    token = loginRes.body.data.token;
    userId = loginRes.body.data._id;

    await request(app)
      .post('/api/v1/repositories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: repoName, visibility: 'public' });

    const repoPath = path.resolve(process.cwd(), 'repositories', userId.toString(), repoName);
    fs.mkdirSync(path.join(repoPath, 'src'), { recursive: true });
    fs.mkdirSync(path.join(repoPath, 'node_modules'), { recursive: true });
    fs.writeFileSync(
      path.join(repoPath, 'src', 'api.js'),
      [
        "import express from 'express';",
        "import { UserService } from './services/userService.js';",
        "const router = express.Router();",
        'export function listUsers() { return []; }',
        'class UserService {}',
        "router.get('/users', listUsers);",
        'module.exports.health = () => true;',
      ].join('\n')
    );
    fs.mkdirSync(path.join(repoPath, 'src', 'services'), { recursive: true });
    fs.writeFileSync(
      path.join(repoPath, 'src', 'services', 'userService.js'),
      ['export class UserService {}', 'export const findUsers = () => [];'].join('\n')
    );
    fs.writeFileSync(path.join(repoPath, 'node_modules', 'ignored.js'), 'export function ignored() {}');
  });

  afterEach(() => {
    if (userId) {
      const repoPath = path.resolve(process.cwd(), 'repositories', userId.toString(), repoName);
      if (fs.existsSync(repoPath)) {
        fs.rmSync(repoPath, { recursive: true, force: true });
      }
    }
  });

  test('extracts JS/TS symbols with line metadata', () => {
    const symbols = extractSymbolsFromContent(
      [
        "import express from 'express';",
        'export class ApiClient {}',
        'export const handler = () => {};',
        "app.post('/login', handler);",
      ].join('\n'),
      'src/server.ts'
    );

    expect(symbols).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ symbolType: 'import', symbolName: 'express', line: 1 }),
        expect.objectContaining({ symbolType: 'class', symbolName: 'ApiClient', line: 2 }),
        expect.objectContaining({ symbolType: 'export', symbolName: 'handler', line: 3 }),
        expect.objectContaining({ symbolType: 'route', symbolName: 'POST /login', line: 4 }),
      ])
    );
  });

  test('extracts dependency graph edges without duplicates', () => {
    const files = [
      {
        path: 'src/api.js',
        content: [
          "import express from 'express';",
          "import { UserService } from './services/userService.js';",
          "router.get('/users', listUsers);",
          'const service = new UserService();',
        ].join('\n'),
      },
      { path: 'src/services/userService.js', content: 'export class UserService {}' },
    ];
    const symbols = extractSymbolsFromContent(files[1].content, files[1].path);

    const edges = extractDependencyEdgesFromFiles(files, symbols);

    expect(edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ dependencyType: 'external_import', targetSymbol: 'express' }),
        expect.objectContaining({ dependencyType: 'internal_import', targetSymbol: 'src/services/userService.js' }),
        expect.objectContaining({ dependencyType: 'route_handler', sourceSymbol: 'GET /users', targetSymbol: 'listUsers' }),
        expect.objectContaining({ dependencyType: 'export', targetSymbol: 'UserService' }),
      ])
    );
    expect(new Set(edges.map((edge) => `${edge.sourceSymbol}:${edge.targetSymbol}:${edge.dependencyType}`)).size).toBe(edges.length);
  });

  test('indexing saga rebuilds symbols cleanly', async () => {
    const triggerRes = await request(app)
      .post(`/api/v1/repositories/${username}/${repoName}/index`)
      .set('Authorization', `Bearer ${token}`);

    expect(triggerRes.statusCode).toBe(202);
    const { indexId } = triggerRes.body.data;

    let statusRes;
    for (let i = 0; i < 10; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      statusRes = await request(app)
        .get(`/api/v1/repositories/${username}/${repoName}/index/status/${indexId}`)
        .set('Authorization', `Bearer ${token}`);
      if (statusRes.body.data.status === 'completed') break;
    }

    expect(statusRes.body.data.status).toBe('completed');
    expect(statusRes.body.data.summary.symbolCount).toBeGreaterThanOrEqual(5);

    const state = await SagaState.findOne({ sagaId: indexId });
    expect(state.retryCount).toBe(0);

    const symbols = await IndexedSymbol.find({ repositoryName: repoName });
    expect(symbols.map((symbol) => symbol.symbolName)).toContain('listUsers');
    expect(symbols.map((symbol) => symbol.symbolName)).not.toContain('ignored');

    const dependencies = await DependencyGraph.find({});
    expect(dependencies.map((edge) => edge.dependencyType)).toEqual(
      expect.arrayContaining(['external_import', 'internal_import', 'route_handler', 'export'])
    );
  });

  test('symbol search and detail APIs return indexed symbols', async () => {
    const triggerRes = await request(app)
      .post(`/api/v1/repositories/${username}/${repoName}/index`)
      .set('Authorization', `Bearer ${token}`);

    for (let i = 0; i < 10; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const state = await SagaState.findOne({ sagaId: triggerRes.body.data.indexId });
      if (state?.status === 'completed') break;
    }

    const searchRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/symbols/search?q=list&symbolType=function`);

    expect(searchRes.statusCode).toBe(200);
    expect(searchRes.body.data.symbols.length).toBe(1);
    symbolId = searchRes.body.data.symbols[0]._id;

    const detailRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/symbols/${symbolId}`);

    expect(detailRes.statusCode).toBe(200);
    expect(detailRes.body.data.symbolName).toBe('listUsers');
    expect(detailRes.body.data.filePath).toBe('src/api.js');
  });

  test('dependency APIs rebuild, list, inspect symbols, and analyze impact', async () => {
    const rebuildRes = await request(app)
      .post(`/api/v1/repositories/${username}/${repoName}/dependencies/rebuild`)
      .set('Authorization', `Bearer ${token}`);

    expect(rebuildRes.statusCode).toBe(200);
    expect(rebuildRes.body.data.edgeCount).toBeGreaterThanOrEqual(4);

    const listRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/dependencies?dependencyType=internal_import`)
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.data.dependencies[0]).toMatchObject({
      dependencyType: 'internal_import',
      targetSymbol: 'src/services/userService.js',
    });

    const symbolRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/dependencies/symbol/UserService`)
      .set('Authorization', `Bearer ${token}`);

    expect(symbolRes.statusCode).toBe(200);
    expect(symbolRes.body.data.dependents.length).toBeGreaterThan(0);

    const impactRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/dependencies/impact?file=src/services/userService.js`)
      .set('Authorization', `Bearer ${token}`);

    expect(impactRes.statusCode).toBe(200);
    expect(impactRes.body.data.directDependents.map((edge) => edge.filePath)).toContain('src/api.js');
    expect(impactRes.body.data.affectedFiles).toContain('src/api.js');
  });

  test('impact analysis returns dependents for changed modules', async () => {
    await DependencyGraph.insertMany([
      {
        repositoryId: userId,
        filePath: 'src/api.js',
        sourceSymbol: 'src/api.js',
        sourceType: 'module',
        targetSymbol: 'src/service.js',
        targetType: 'module',
        dependencyType: 'internal_import',
        metadata: { targetFile: 'src/service.js' },
      },
    ]);

    const impact = await ImpactAnalysis.analyze({ repositoryId: userId, file: 'src/service.js' });

    expect(impact.directDependents).toHaveLength(1);
    expect(impact.affectedFiles).toEqual(['src/api.js']);
    expect(impact.depthSummary).toEqual({ 1: 1 });
  });
});
