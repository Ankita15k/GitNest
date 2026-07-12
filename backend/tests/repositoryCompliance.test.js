import request from 'supertest';
import ArchitectureAnalysis from '../src/models/ArchitectureAnalysis.model.js';
import RepositoryCompliance from '../src/models/RepositoryCompliance.model.js';
import RepositoryHealth from '../src/models/RepositoryHealth.model.js';
import SecurityEvent from '../src/models/SecurityEvent.model.js';
import { ComplianceReport } from '../src/services/complianceReport.service.js';
import { PolicyEvaluation } from '../src/services/policyEvaluation.service.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'test-client';
process.env.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'test-secret';
process.env.GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost/auth/github/callback';

const { default: app } = await import('../src/app.js');

describe('Repository compliance policy enforcement', () => {
  test('evaluates policies, score, and status deterministically', () => {
    const compliant = PolicyEvaluation.evaluate({
      repositoryName: 'clean',
      health: { overallScore: 92, metrics: { securityFindingCount: 0 } },
      architectureAnalysis: { riskScore: 'LOW', circularDependencyCount: 0, hotspotCount: 0 },
      securityFindings: [],
    });
    expect(compliant.complianceStatus).toBe('COMPLIANT');
    expect(compliant.complianceScore).toBe(100);

    const warning = PolicyEvaluation.evaluate({
      repositoryName: 'warn',
      health: { overallScore: 75, metrics: { securityFindingCount: 1 } },
      architectureAnalysis: { riskScore: 'HIGH', circularDependencyCount: 1, hotspotCount: 3 },
      securityFindings: [{ severity: 'LOW' }],
    });
    expect(warning.complianceStatus).toBe('WARNING');
    expect(warning.violations).toHaveLength(0);
    expect(warning.warnings.map((item) => item.code)).toEqual([
      'MINIMUM_HEALTH_SCORE',
      'MAXIMUM_ARCHITECTURE_RISK',
      'MAXIMUM_SECURITY_FINDINGS',
      'CIRCULAR_DEPENDENCY_THRESHOLD',
      'DEPENDENCY_HOTSPOT_THRESHOLD',
    ]);

    const failed = PolicyEvaluation.evaluate({
      repositoryName: 'failed',
      health: { overallScore: 40, metrics: { securityFindingCount: 4 } },
      architectureAnalysis: { riskScore: 'CRITICAL', circularDependencyCount: 3, hotspotCount: 6 },
      securityFindings: [{}, {}, {}, {}],
    });
    expect(failed.complianceStatus).toBe('NON_COMPLIANT');
    expect(failed.complianceScore).toBe(0);
    expect(failed.violations).toHaveLength(5);
    expect(failed.metrics).toMatchObject({
      healthScore: 40,
      architectureRisk: 'CRITICAL',
      securityFindingCount: 4,
      circularDependencyCount: 3,
      hotspotCount: 6,
    });
  });

  test('generates factual compliance reports', () => {
    const compliance = PolicyEvaluation.evaluate({
      repositoryName: 'report-repo',
      health: { overallScore: 72, metrics: { securityFindingCount: 0 } },
      architectureAnalysis: { riskScore: 'LOW', circularDependencyCount: 0, hotspotCount: 0 },
      securityFindings: [],
    });

    expect(ComplianceReport.generate(compliance)).toMatchObject({
      summary: {
        repositoryName: 'report-repo',
        complianceStatus: 'WARNING',
        warningCount: 1,
        passedCheckCount: 4,
      },
      scoreBreakdown: expect.any(Array),
      metrics: expect.objectContaining({
        healthScore: 72,
        architectureRisk: 'LOW',
      }),
    });
  });

  test('compliance APIs return snapshot, history, violations, and report', async () => {
    const username = 'complianceowner';
    const repoName = 'compliance-repo';

    await request(app).post('/api/v1/auth/register').send({
      username,
      email: 'complianceowner@gitnest.com',
      password: 'Password123',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'complianceowner@gitnest.com', password: 'Password123' });
    const token = loginRes.body.data.token;

    const repoRes = await request(app)
      .post('/api/v1/repositories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: repoName, visibility: 'public' });
    const repositoryId = repoRes.body.data._id;

    await RepositoryHealth.create({
      repositoryId,
      repositoryName: repoName,
      overallScore: 64,
      securityScore: 70,
      architectureScore: 55,
      activityScore: 70,
      maintainabilityScore: 70,
      healthCategory: 'Fair',
      metrics: { securityFindingCount: 4, architectureRisk: 'CRITICAL', hotspotCount: 6, circularDependencyCount: 3 },
    });

    await ArchitectureAnalysis.create({
      repositoryId,
      repositoryName: repoName,
      complexityScore: 20,
      riskScore: 'CRITICAL',
      hotspotCount: 6,
      circularDependencyCount: 3,
      criticalModuleCount: 2,
      summary: 'test',
      metrics: { moduleCount: 2, dependencyCount: 10 },
    });

    await SecurityEvent.insertMany(
      [1, 2, 3, 4].map((index) => ({
        repository: repositoryId,
        scanId: `scan-${index}`,
        type: 'SECRET_EXPOSED',
        severity: 'HIGH',
        message: 'secret found',
      }))
    );

    const complianceRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/compliance`)
      .set('Authorization', `Bearer ${token}`);
    expect(complianceRes.statusCode).toBe(200);
    expect(complianceRes.body.data.complianceStatus).toBe('NON_COMPLIANT');
    expect(complianceRes.body.data.metrics).toMatchObject({
      healthScore: 64,
      architectureRisk: 'CRITICAL',
      securityFindingCount: 4,
    });
    expect(await RepositoryCompliance.countDocuments({ repositoryId })).toBe(1);

    const historyRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/compliance/history`)
      .set('Authorization', `Bearer ${token}`);
    expect(historyRes.statusCode).toBe(200);
    expect(historyRes.body.data.history).toHaveLength(1);

    const violationsRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/compliance/violations`)
      .set('Authorization', `Bearer ${token}`);
    expect(violationsRes.statusCode).toBe(200);
    expect(violationsRes.body.data.violations.length).toBeGreaterThan(0);

    const reportRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/compliance/report`)
      .set('Authorization', `Bearer ${token}`);
    expect(reportRes.statusCode).toBe(200);
    expect(reportRes.body.data.summary.complianceStatus).toBe('NON_COMPLIANT');
    expect(reportRes.body.data.metrics.securityFindingCount).toBe(4);
  });
});
