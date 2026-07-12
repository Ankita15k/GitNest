const addRecommendation = (items, code, message) => {
  items.push({ code, message });
};

export class RepositoryGovernance {
  static summarize(health) {
    return `${health.repositoryName} is ${health.healthCategory} with an overall score of ${health.overallScore}.`;
  }

  static breakdown(health) {
    return {
      overallScore: health.overallScore,
      healthCategory: health.healthCategory,
      scores: {
        security: health.securityScore,
        architecture: health.architectureScore,
        activity: health.activityScore,
        maintainability: health.maintainabilityScore,
      },
      metrics: health.metrics || {},
      generatedAt: health.generatedAt,
    };
  }

  static recommendations(health) {
    const metrics = health.metrics || {};
    const recommendations = [];

    if (metrics.securityFindingCount > 0) {
      addRecommendation(recommendations, 'SECURITY_FINDINGS_PRESENT', 'Security findings present.');
    }
    if (metrics.dependencyCount / Math.max(metrics.moduleCount || 0, 1) > 4) {
      addRecommendation(recommendations, 'HIGH_DEPENDENCY_COUPLING', 'High dependency coupling.');
    }
    if (['HIGH', 'CRITICAL'].includes(metrics.architectureRisk) || metrics.criticalModuleCount > 0) {
      addRecommendation(recommendations, 'EXCESSIVE_ARCHITECTURE_RISK', 'Excessive architecture risk.');
    }
    if ((metrics.activityCount || 0) < 3) {
      addRecommendation(recommendations, 'LOW_REPOSITORY_ACTIVITY', 'Low repository activity.');
    }

    if (recommendations.length === 0) {
      addRecommendation(recommendations, 'NO_ACTION_REQUIRED', 'No immediate governance action required.');
    }

    return recommendations;
  }
}

export default RepositoryGovernance;
