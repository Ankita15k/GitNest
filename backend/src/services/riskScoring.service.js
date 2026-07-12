const LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export class RiskScoring {
  static scoreModule({ dependencyCount = 0, couplingLevel = 0, circularDependencyCount = 0, hotspotParticipation = 0 } = {}) {
    let points = 0;

    if (dependencyCount >= 10) points += 3;
    else if (dependencyCount >= 5) points += 2;
    else if (dependencyCount >= 2) points += 1;

    if (couplingLevel >= 12) points += 3;
    else if (couplingLevel >= 6) points += 2;
    else if (couplingLevel >= 3) points += 1;

    points += Math.min(circularDependencyCount * 2, 4);
    points += Math.min(hotspotParticipation, 3);

    if (points >= 8) return 'CRITICAL';
    if (points >= 5) return 'HIGH';
    if (points >= 2) return 'MEDIUM';
    return 'LOW';
  }

  static scoreRepository({ dependencyCount = 0, couplingLevel = 0, circularDependencyCount = 0, hotspotCount = 0 } = {}) {
    const riskScore = this.scoreModule({
      dependencyCount,
      couplingLevel,
      circularDependencyCount,
      hotspotParticipation: hotspotCount,
    });

    return {
      riskScore,
      rank: LEVELS.indexOf(riskScore) + 1,
    };
  }
}

export default RiskScoring;
