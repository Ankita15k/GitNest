import request from 'supertest';
import ArchitectureAnalysis from '../src/models/ArchitectureAnalysis.model.js';
import DependencyGraph from '../src/models/DependencyGraph.model.js';
import IndexedSymbol from '../src/models/IndexedSymbol.model.js';
import { detectCircularDependencies, detectHotspots } from '../src/services/architectureMapping.service.js';
import RiskScoring from '../src/services/riskScoring.service.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'test-client';
process.env.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'test-secret';
process.env.GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost/auth/github/callback';

const { default: app } = await import('../src/app.js');

describe('Architecture intelligence', () => {
  test('detects two and three node circular dependencies only within depth limit', () => {
    const cycles = detectCircularDependencies([
      { dependencyType: 'internal_import', sourceSymbol: 'A', targetSymbol: 'B' },
      { dependencyType: 'internal_import', sourceSymbol: 'B', targetSymbol: 'A' },
      { dependencyType: 'internal_import', sourceSymbol: 'C', targetSymbol: 'D' },
      { dependencyType: 'internal_import', sourceSymbol: 'D', targetSymbol: 'E' },
      { dependencyType: 'internal_import', sourceSymbol: 'E', targetSymbol: 'C' },
      { dependencyType: 'internal_import', sourceSymbol: 'F', targetSymbol: 'G' },
    ]);

    expect(cycles).toEqual(expect.arrayContaining([['A', 'B', 'A'], ['C', 'D', 'E', 'C']]));
  });

  test('detects highly referenced modules and depended-on symbols', () => {
    const hotspots = detectHotspots(
      [
        { filePath: 'src/a.js', targetType: 'module', targetSymbol: 'src/core.js' },
        { filePath: 'src/b.js', targetType: 'module', targetSymbol: 'src/core.js' },
        { filePath: 'src/c.js', targetType: 'symbol', targetSymbol: 'buildCore' },
      ],
      [{ filePath: 'src/core.js', symbolName: 'buildCore' }]
    );

    expect(hotspots[0]).toMatchObject({ moduleName: 'src/core.js', referenceCount: 3 });
  });

  test('scores risk deterministically', () => {
    expect(RiskScoring.scoreModule({ dependencyCount: 1 })).toBe('LOW');
    expect(RiskScoring.scoreModule({ dependencyCount: 6, couplingLevel: 6 })).toBe('HIGH');
    expect(RiskScoring.scoreModule({ dependencyCount: 10, couplingLevel: 12, circularDependencyCount: 1 })).toBe('CRITICAL');
  });

  test('architecture APIs return persisted analysis, hotspots, risk, and module details', async () => {
    const username = 'archowner';
    const repoName = 'arch-repo';

    await request(app).post('/api/v1/auth/register').send({
      username,
      email: 'archowner@gitnest.com',
      password: 'Password123',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'archowner@gitnest.com', password: 'Password123' });

    const token = loginRes.body.data.token;

    const repoRes = await request(app)
      .post('/api/v1/repositories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: repoName, visibility: 'public' });

    const repositoryId = repoRes.body.data._id;

    await IndexedSymbol.insertMany([
      {
        repositoryId,
        repositoryName: repoName,
        owner: username,
        filePath: 'src/core.js',
        symbolName: 'buildCore',
        symbolType: 'export',
        line: 1,
      },
      {
        repositoryId,
        repositoryName: repoName,
        owner: username,
        filePath: 'src/api.js',
        symbolName: 'GET /items',
        symbolType: 'route',
        line: 2,
      },
    ]);

    await DependencyGraph.insertMany([
      {
        repositoryId,
        filePath: 'src/api.js',
        sourceSymbol: 'src/api.js',
        sourceType: 'module',
        targetSymbol: 'src/core.js',
        targetType: 'module',
        dependencyType: 'internal_import',
      },
      {
        repositoryId,
        filePath: 'src/core.js',
        sourceSymbol: 'src/core.js',
        sourceType: 'module',
        targetSymbol: 'src/api.js',
        targetType: 'module',
        dependencyType: 'internal_import',
      },
    ]);

    const architectureRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/architecture`)
      .set('Authorization', `Bearer ${token}`);

    expect(architectureRes.statusCode).toBe(200);
    expect(architectureRes.body.data.circularDependencyCount).toBe(1);
    expect(await ArchitectureAnalysis.countDocuments({ repositoryId })).toBe(1);

    const hotspotsRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/architecture/hotspots`)
      .set('Authorization', `Bearer ${token}`);

    expect(hotspotsRes.statusCode).toBe(200);
    expect(hotspotsRes.body.data.hotspots.length).toBeGreaterThan(0);

    const riskRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/architecture/risk`)
      .set('Authorization', `Bearer ${token}`);

    expect(riskRes.statusCode).toBe(200);
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(riskRes.body.data.riskScore);

    const moduleRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/architecture/module/${encodeURIComponent('src/core.js')}`)
      .set('Authorization', `Bearer ${token}`);

    expect(moduleRes.statusCode).toBe(200);
    expect(moduleRes.body.data.module.moduleName).toBe('src/core.js');
  });
});
