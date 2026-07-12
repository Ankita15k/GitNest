export class ComplianceReport {
  static generate(compliance) {
    const scoreBreakdown = (compliance.policyResults || []).map((result) => ({
      code: result.code,
      status: result.status,
      value: result.value,
      threshold: result.threshold,
      scoreImpact: result.scoreImpact,
    }));

    return {
      summary: {
        repositoryName: compliance.repositoryName,
        complianceStatus: compliance.complianceStatus,
        complianceScore: compliance.complianceScore,
        generatedAt: compliance.generatedAt,
        violationCount: compliance.violations?.length || 0,
        warningCount: compliance.warnings?.length || 0,
        passedCheckCount: compliance.passedChecks?.length || 0,
      },
      violations: compliance.violations || [],
      warnings: compliance.warnings || [],
      passedChecks: compliance.passedChecks || [],
      scoreBreakdown,
      metrics: compliance.metrics || {},
    };
  }
}

export default ComplianceReport;
