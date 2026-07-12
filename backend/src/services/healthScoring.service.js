import Activity from '../models/Activity.model.js';
import ArchitectureAnalysis from '../models/ArchitectureAnalysis.model.js';
import DependencyGraph from '../models/DependencyGraph.model.js';
import PullRequest from '../models/PullRequest.model.js';
import RepositoryHealth from '../models/RepositoryHealth.model.js';
import SecurityEvent from '../models/SecurityEvent.model.js';

const RISK_PENALTY = { LOW: 0, MEDIUM: 12, HIGH: 25, CRITICAL: 40 };
const SEVERITY_PENALTY = { LOW: 3, MEDIUM: 8, HIGH: 18, CRITICAL: 30 };

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

export const categoryForScore = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
};

const scoreSecurity = (events) => {
  const penalty = events.reduce((total, event) => total + (SEVERITY_PENALTY[event.severity] || 0), 0);
  return clampScore(100 - penalty);
};

const scoreArchitecture = (analysis) => {
  if (!analysis) return 70;

  return clampScore(
    100 -
      (RISK_PENALTY[analysis.riskScore] || 0) -
      analysis.hotspotCount * 3 -
      analysis.circularDependencyCount * 8 -
      analysis.criticalModuleCount * 5 -
      Math.min(20, analysis.complexityScore / 2)
  );
};

const scoreActivity = ({ activityCount, pullRequestCount, openPullRequestCount }) =>
  clampScore(40 + Math.min(40, activityCount * 4) + Math.min(20, pullRequestCount * 5) - Math.min(20, openPullRequestCount * 2));

const scoreMaintainability = ({ dependencyCount, moduleCount, mergedPullRequestCount, pullRequestCount }) => {
  const density = dependencyCount / Math.max(moduleCount, 1);
  const mergeRatio = pullRequestCount > 0 ? mergedPullRequestCount / pullRequestCount : 0;
  return clampScore(100 - Math.min(35, density * 5) + Math.round(mergeRatio * 10));
};

export class HealthScoring {
  static calculate(snapshot = {}) {
    const securityScore = scoreSecurity(snapshot.securityEvents || []);
    const architectureScore = scoreArchitecture(snapshot.architectureAnalysis);
    const activityScore = scoreActivity(snapshot);
    const maintainabilityScore = scoreMaintainability(snapshot);
    const overallScore = clampScore(
      securityScore * 0.3 + architectureScore * 0.3 + activityScore * 0.2 + maintainabilityScore * 0.2
    );

    return {
      overallScore,
      securityScore,
      architectureScore,
      activityScore,
      maintainabilityScore,
      healthCategory: categoryForScore(overallScore),
    };
  }

  static async generate({ repositoryId, repositoryName, session } = {}) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      securityEvents,
      dependencyCount,
      architectureAnalysis,
      activityCount,
      pullRequestCount,
      openPullRequestCount,
      mergedPullRequestCount,
    ] = await Promise.all([
      SecurityEvent.find({ repository: repositoryId }).session(session || null).lean(),
      DependencyGraph.countDocuments({ repositoryId }).session(session || null),
      ArchitectureAnalysis.findOne({ repositoryId }).sort({ generatedAt: -1 }).session(session || null).lean(),
      Activity.countDocuments({ repository: repositoryId, createdAt: { $gte: thirtyDaysAgo } }).session(session || null),
      PullRequest.countDocuments({ repository: repositoryId }).session(session || null),
      PullRequest.countDocuments({ repository: repositoryId, status: 'open' }).session(session || null),
      PullRequest.countDocuments({ repository: repositoryId, status: 'merged' }).session(session || null),
    ]);

    const moduleCount = architectureAnalysis?.metrics?.moduleCount || 0;
    const scores = this.calculate({
      securityEvents,
      dependencyCount,
      architectureAnalysis,
      activityCount,
      pullRequestCount,
      openPullRequestCount,
      mergedPullRequestCount,
      moduleCount,
    });

    return {
      repositoryId,
      repositoryName,
      ...scores,
      metrics: {
        securityFindingCount: securityEvents.length,
        dependencyCount,
        moduleCount,
        architectureRisk: architectureAnalysis?.riskScore || 'LOW',
        hotspotCount: architectureAnalysis?.hotspotCount || 0,
        circularDependencyCount: architectureAnalysis?.circularDependencyCount || 0,
        criticalModuleCount: architectureAnalysis?.criticalModuleCount || 0,
        activityCount,
        pullRequestCount,
        openPullRequestCount,
        mergedPullRequestCount,
      },
      generatedAt: new Date(),
    };
  }

  static async generateAndPersist({ repositoryId, repositoryName, session } = {}) {
    const snapshot = await this.generate({ repositoryId, repositoryName, session });
    const [document] = await RepositoryHealth.create([snapshot], { session });
    return document;
  }
}

export default HealthScoring;
