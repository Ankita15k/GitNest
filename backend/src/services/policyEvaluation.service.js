import ArchitectureAnalysis from '../models/ArchitectureAnalysis.model.js';
import DependencyGraph from '../models/DependencyGraph.model.js';
import RepositoryCompliance from '../models/RepositoryCompliance.model.js';
import RepositoryHealth from '../models/RepositoryHealth.model.js';
import SecurityEvent from '../models/SecurityEvent.model.js';

export const COMPLIANCE_THRESHOLDS = {
  minimumHealthScore: 70,
  warningHealthScore: 80,
  maximumArchitectureRisk: 'HIGH',
  maximumSecurityFindings: 3,
  warningSecurityFindings: 1,
  circularDependencyThreshold: 2,
  warningCircularDependencies: 1,
  dependencyHotspotThreshold: 5,
  warningDependencyHotspots: 3,
};

const RISK_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const check = ({ code, message, value, threshold, fail, warn, impact }) => {
  if (fail) return { result: 'FAIL', item: { code, message, severity: 'HIGH', value, threshold }, impact };
  if (warn) return { result: 'WARNING', item: { code, message, severity: 'MEDIUM', value, threshold }, impact: Math.ceil(impact / 2) };
  return { result: 'PASS', item: { code, message, severity: 'LOW', value, threshold }, impact: 0 };
};

const buildResult = ({ result, item, impact }) => ({
  ...item,
  status: result,
  scoreImpact: impact,
});

export class PolicyEvaluation {
  static evaluate({ repositoryId, repositoryName, health, securityFindings = [], architectureAnalysis, dependencyCount = 0 } = {}) {
    const metrics = health?.metrics || {};
    const architectureRisk = architectureAnalysis?.riskScore || metrics.architectureRisk || 'LOW';
    const circularDependencyCount = architectureAnalysis?.circularDependencyCount ?? metrics.circularDependencyCount ?? 0;
    const hotspotCount = architectureAnalysis?.hotspotCount ?? metrics.hotspotCount ?? 0;
    const securityFindingCount = securityFindings.length || metrics.securityFindingCount || 0;

    const checks = [
      check({
        code: 'MINIMUM_HEALTH_SCORE',
        message: 'Repository health score meets policy.',
        value: health?.overallScore ?? 0,
        threshold: COMPLIANCE_THRESHOLDS.minimumHealthScore,
        fail: (health?.overallScore ?? 0) < COMPLIANCE_THRESHOLDS.minimumHealthScore,
        warn: (health?.overallScore ?? 0) < COMPLIANCE_THRESHOLDS.warningHealthScore,
        impact: 25,
      }),
      check({
        code: 'MAXIMUM_ARCHITECTURE_RISK',
        message: 'Architecture risk is within policy.',
        value: architectureRisk,
        threshold: COMPLIANCE_THRESHOLDS.maximumArchitectureRisk,
        fail: RISK_RANK[architectureRisk] > RISK_RANK[COMPLIANCE_THRESHOLDS.maximumArchitectureRisk],
        warn: architectureRisk === COMPLIANCE_THRESHOLDS.maximumArchitectureRisk,
        impact: 20,
      }),
      check({
        code: 'MAXIMUM_SECURITY_FINDINGS',
        message: 'Security findings are within policy.',
        value: securityFindingCount,
        threshold: COMPLIANCE_THRESHOLDS.maximumSecurityFindings,
        fail: securityFindingCount > COMPLIANCE_THRESHOLDS.maximumSecurityFindings,
        warn: securityFindingCount >= COMPLIANCE_THRESHOLDS.warningSecurityFindings,
        impact: 25,
      }),
      check({
        code: 'CIRCULAR_DEPENDENCY_THRESHOLD',
        message: 'Circular dependencies are within policy.',
        value: circularDependencyCount,
        threshold: COMPLIANCE_THRESHOLDS.circularDependencyThreshold,
        fail: circularDependencyCount > COMPLIANCE_THRESHOLDS.circularDependencyThreshold,
        warn: circularDependencyCount >= COMPLIANCE_THRESHOLDS.warningCircularDependencies,
        impact: 15,
      }),
      check({
        code: 'DEPENDENCY_HOTSPOT_THRESHOLD',
        message: 'Dependency hotspots are within policy.',
        value: hotspotCount,
        threshold: COMPLIANCE_THRESHOLDS.dependencyHotspotThreshold,
        fail: hotspotCount > COMPLIANCE_THRESHOLDS.dependencyHotspotThreshold,
        warn: hotspotCount >= COMPLIANCE_THRESHOLDS.warningDependencyHotspots,
        impact: 15,
      }),
    ];

    const violations = checks.filter((entry) => entry.result === 'FAIL').map((entry) => entry.item);
    const warnings = checks.filter((entry) => entry.result === 'WARNING').map((entry) => entry.item);
    const passedChecks = checks.filter((entry) => entry.result === 'PASS').map((entry) => entry.item);
    const complianceScore = clampScore(100 - checks.reduce((total, entry) => total + entry.impact, 0));
    const complianceStatus = violations.length > 0 ? 'NON_COMPLIANT' : warnings.length > 0 ? 'WARNING' : 'COMPLIANT';

    return {
      repositoryId,
      repositoryName,
      complianceStatus,
      complianceScore,
      violations,
      warnings,
      passedChecks,
      policyResults: checks.map(buildResult),
      metrics: {
        healthScore: health?.overallScore ?? 0,
        architectureRisk,
        securityFindingCount,
        circularDependencyCount,
        hotspotCount,
        dependencyCount,
      },
      generatedAt: new Date(),
    };
  }

  static async evaluateRepository({ repositoryId, repositoryName, health, session } = {}) {
    const [latestHealth, securityFindings, architectureAnalysis, dependencyCount] = await Promise.all([
      health
        ? Promise.resolve(health)
        : RepositoryHealth.findOne({ repositoryId }).sort({ generatedAt: -1 }).session(session || null).lean(),
      SecurityEvent.find({ repository: repositoryId }).session(session || null).lean(),
      ArchitectureAnalysis.findOne({ repositoryId }).sort({ generatedAt: -1 }).session(session || null).lean(),
      DependencyGraph.countDocuments({ repositoryId }).session(session || null),
    ]);

    return this.evaluate({
      repositoryId,
      repositoryName,
      health: latestHealth,
      securityFindings,
      architectureAnalysis,
      dependencyCount,
    });
  }

  static async evaluateAndPersist({ repositoryId, repositoryName, health, session } = {}) {
    const snapshot = await this.evaluateRepository({ repositoryId, repositoryName, health, session });
    const [document] = await RepositoryCompliance.create([snapshot], { session });
    return document;
  }
}

export default PolicyEvaluation;
