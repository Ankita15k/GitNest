import request from 'supertest';
import Activity from '../src/models/Activity.model.js';
import ArchitectureAnalysis from '../src/models/ArchitectureAnalysis.model.js';
import RepositoryHealth from '../src/models/RepositoryHealth.model.js';
import SecurityEvent from '../src/models/SecurityEvent.model.js';
import { categoryForScore, HealthScoring } from '../src/services/healthScoring.service.js';
import { RepositoryGovernance } from '../src/services/repositoryGovernance.service.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'test-client';
process.env.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'test-secret';
process.env.GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost/auth/github/callback';

const { default: app } = await import('../src/app.js');

describe('Repository health scoring and governance', () => {
  test('assigns fixed health categories', () => {
    expect(categoryForScore(95)).toBe('Excellent');
    expect(categoryForScore(80)).toBe('Good');
    expect(categoryForScore(65)).toBe('Fair');
    expect(categoryForScore(45)).toBe('Poor');
    expect(categoryForScore(20)).toBe('Critical');
  });

  test('calculates deterministic scores from repository signals', () => {
    const result = HealthScoring.calculate({
      securityEvents: [{ severity: 'HIGH' }, { severity: 'LOW' }],
      architectureAnalysis: {
        riskScore: 'HIGH',
        hotspotCount: 2,
        circularDependencyCount: 1,
        criticalModuleCount: 1,
        complexityScore: 20,
      },
      dependencyCount: 12,
      moduleCount: 3,
      activityCount: 4,
      pullRequestCount: 2,
      openPullRequestCount: 1,
      mergedPullRequestCount: 1,
    });

    expect(result).toMatchObject({
      securityScore: 79,
      architectureScore: 46,
      activityScore: 64,
      maintainabilityScore: 85,
      overallScore: 67,
      healthCategory: 'Fair',
    });
  });

  test('generates rule-based recommendations', () => {
    const recommendations = RepositoryGovernance.recommendations({
      metrics: {
        securityFindingCount: 1,
        dependencyCount: 20,
        moduleCount: 2,
        architectureRisk: 'CRITICAL',
        criticalModuleCount: 1,
        activityCount: 0,
      },
    });

    expect(recommendations.map((item) => item.code)).toEqual([
      'SECURITY_FINDINGS_PRESENT',
      'HIGH_DEPENDENCY_COUPLING',
      'EXCESSIVE_ARCHITECTURE_RISK',
      'LOW_REPOSITORY_ACTIVITY',
    ]);
  });

  test('health APIs return snapshot, history, breakdown, and recommendations', async () => {
    const username = 'healthowner';
    const repoName = 'health-repo';

    await request(app).post('/api/v1/auth/register').send({
      username,
      email: 'healthowner@gitnest.com',
      password: 'Password123',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'healthowner@gitnest.com', password: 'Password123' });

    const token = loginRes.body.data.token;
    const repoRes = await request(app)
      .post('/api/v1/repositories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: repoName, visibility: 'public' });

    const repositoryId = repoRes.body.data._id;

    await ArchitectureAnalysis.create({
      repositoryId,
      repositoryName: repoName,
      complexityScore: 12,
      riskScore: 'MEDIUM',
      hotspotCount: 1,
      circularDependencyCount: 0,
      criticalModuleCount: 0,
      summary: 'test',
      metrics: { moduleCount: 2, dependencyCount: 5 },
    });

    await SecurityEvent.create({
      repository: repositoryId,
      scanId: 'scan-1',
      type: 'SECRET_EXPOSED',
      severity: 'HIGH',
      message: 'secret found',
    });

    await Activity.create({
      actor: repoRes.body.data.owner,
      repository: repositoryId,
      type: 'REPOSITORY_CREATED',
      visibility: 'public',
    });

    const healthRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/health`)
      .set('Authorization', `Bearer ${token}`);

    expect(healthRes.statusCode).toBe(200);
    expect(healthRes.body.data.overallScore).toBeGreaterThanOrEqual(0);
    expect(healthRes.body.data.summary).toContain(repoName);
    expect(await RepositoryHealth.countDocuments({ repositoryId })).toBe(1);

    const historyRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/health/history`)
      .set('Authorization', `Bearer ${token}`);
    expect(historyRes.statusCode).toBe(200);
    expect(historyRes.body.data.history).toHaveLength(1);

    const breakdownRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/health/breakdown`)
      .set('Authorization', `Bearer ${token}`);
    expect(breakdownRes.statusCode).toBe(200);
    expect(breakdownRes.body.data.scores.security).toBe(82);

    const recommendationsRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/health/recommendations`)
      .set('Authorization', `Bearer ${token}`);
    expect(recommendationsRes.statusCode).toBe(200);
    expect(recommendationsRes.body.data.recommendations[0].code).toBe('SECURITY_FINDINGS_PRESENT');
  });
});
