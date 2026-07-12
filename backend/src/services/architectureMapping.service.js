import ArchitectureAnalysis from '../models/ArchitectureAnalysis.model.js';
import DependencyGraph from '../models/DependencyGraph.model.js';
import IndexedSymbol from '../models/IndexedSymbol.model.js';
import RiskScoring from './riskScoring.service.js';

const INTERNAL_TYPES = new Set(['internal_import']);
const RISK_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

const moduleFromFile = (filePath = '') => {
  const parts = filePath.split('/').filter(Boolean);
  return parts.length > 1 ? parts[0] : filePath || 'root';
};

const unique = (items) => [...new Set(items.filter(Boolean))];

export const detectCircularDependencies = (edges = [], maxDepth = 3) => {
  const graph = new Map();

  edges
    .filter((edge) => INTERNAL_TYPES.has(edge.dependencyType) && edge.sourceSymbol && edge.targetSymbol)
    .forEach((edge) => {
      graph.set(edge.sourceSymbol, unique([...(graph.get(edge.sourceSymbol) || []), edge.targetSymbol]));
    });

  const cycles = [];
  const seen = new Set();

  const walk = (start, node, trail) => {
    if (trail.length > maxDepth) return;

    for (const next of graph.get(node) || []) {
      if (next === start && trail.length >= 2) {
        const cycle = [...trail, start];
        const key = cycle.slice(0, -1).sort().join('|');
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push(cycle);
        }
        continue;
      }

      if (!trail.includes(next)) walk(start, next, [...trail, next]);
    }
  };

  for (const node of graph.keys()) walk(node, node, [node]);
  return cycles;
};

export const detectHotspots = (edges = [], symbols = [], limit = 10) => {
  const byModule = new Map();
  const bySymbol = new Map();

  edges.forEach((edge) => {
    const target = edge.targetType === 'module' ? edge.targetSymbol : edge.metadata?.targetFile || edge.filePath;
    const source = edge.sourceSymbol || edge.filePath;

    if (target) {
      const current = byModule.get(target) || { moduleName: target, referenceCount: 0, dependentFiles: new Set(), reasons: [] };
      current.referenceCount += 1;
      current.dependentFiles.add(edge.filePath || source);
      byModule.set(target, current);
    }

    if (edge.targetType === 'symbol') {
      bySymbol.set(edge.targetSymbol, (bySymbol.get(edge.targetSymbol) || 0) + 1);
    }
  });

  symbols.forEach((symbol) => {
    if (!bySymbol.has(symbol.symbolName)) return;
    const current = byModule.get(symbol.filePath) || {
      moduleName: symbol.filePath,
      referenceCount: 0,
      dependentFiles: new Set(),
      reasons: [],
    };
    current.referenceCount += bySymbol.get(symbol.symbolName);
    current.reasons.push(`symbol:${symbol.symbolName}`);
    byModule.set(symbol.filePath, current);
  });

  return [...byModule.values()]
    .map((item) => ({
      moduleName: item.moduleName,
      referenceCount: item.referenceCount,
      dependentFileCount: item.dependentFiles.size,
      reasons: unique([
        ...item.reasons,
        item.referenceCount >= 3 ? 'high_reference_count' : null,
        item.dependentFiles.size >= 3 ? 'high_connectivity' : null,
      ]),
    }))
    .filter((item) => item.referenceCount >= 2 || item.dependentFileCount >= 2)
    .sort((a, b) => b.referenceCount - a.referenceCount || a.moduleName.localeCompare(b.moduleName))
    .slice(0, limit);
};

const buildModuleRelationships = (edges) =>
  edges
    .filter((edge) => INTERNAL_TYPES.has(edge.dependencyType))
    .map((edge) => ({
      source: edge.sourceSymbol,
      target: edge.targetSymbol,
      sourceModule: moduleFromFile(edge.sourceSymbol),
      targetModule: moduleFromFile(edge.targetSymbol),
      type: edge.dependencyType,
    }));

const buildModuleStats = ({ edges, symbols, cycles, hotspots }) => {
  const modules = new Map();
  const cycleModules = new Set(cycles.flat());
  const hotspotMap = new Map(hotspots.map((hotspot) => [hotspot.moduleName, hotspot]));

  const ensure = (name) => {
    if (!modules.has(name)) {
      modules.set(name, {
        moduleName: name,
        fileCount: 0,
        symbolCount: 0,
        dependencyCount: 0,
        dependentCount: 0,
        riskScore: 'LOW',
      });
    }
    return modules.get(name);
  };

  symbols.forEach((symbol) => {
    const moduleName = symbol.filePath;
    const module = ensure(moduleName);
    module.symbolCount += 1;
    module.fileCount = 1;
  });

  edges.forEach((edge) => {
    const source = ensure(edge.sourceSymbol || edge.filePath);
    source.dependencyCount += 1;
    if (edge.targetSymbol) ensure(edge.targetSymbol).dependentCount += 1;
  });

  return [...modules.values()]
    .map((module) => {
      const circularDependencyCount = cycleModules.has(module.moduleName) ? 1 : 0;
      const hotspotParticipation = hotspotMap.has(module.moduleName) ? 1 : 0;
      const couplingLevel = module.dependencyCount + module.dependentCount;
      return {
        ...module,
        couplingLevel,
        riskScore: RiskScoring.scoreModule({
          dependencyCount: module.dependencyCount,
          couplingLevel,
          circularDependencyCount,
          hotspotParticipation,
        }),
      };
    })
    .sort((a, b) => RISK_RANK[b.riskScore] - RISK_RANK[a.riskScore] || b.couplingLevel - a.couplingLevel);
};

export class ArchitectureMapping {
  static build({ repositoryId, repositoryName, symbols = [], edges = [] } = {}) {
    const internalEdges = edges.filter((edge) => INTERNAL_TYPES.has(edge.dependencyType));
    const relationships = buildModuleRelationships(edges);
    const circularDependencies = detectCircularDependencies(edges, 3);
    const hotspots = detectHotspots(edges, symbols);
    const modules = buildModuleStats({ edges, symbols, cycles: circularDependencies, hotspots });
    const entryPoints = unique([
      ...symbols.filter((symbol) => symbol.symbolType === 'route').map((symbol) => symbol.filePath),
      ...edges.filter((edge) => edge.dependencyType === 'route_handler').map((edge) => edge.filePath),
    ]);
    const serviceBoundaries = modules.filter((module) => /service|controller|route/i.test(module.moduleName));
    const criticalModuleCount = modules.filter((module) => ['HIGH', 'CRITICAL'].includes(module.riskScore)).length;
    const dependencyDensity = Number((edges.length / Math.max(modules.length, 1)).toFixed(2));
    const complexityScore = Math.round(dependencyDensity * 10 + circularDependencies.length * 5 + hotspots.length * 2);
    const repositoryRisk = RiskScoring.scoreRepository({
      dependencyCount: edges.length,
      couplingLevel: dependencyDensity,
      circularDependencyCount: circularDependencies.length,
      hotspotCount: hotspots.length,
    });

    return {
      repositoryId,
      repositoryName,
      complexityScore,
      riskScore: repositoryRisk.riskScore,
      hotspotCount: hotspots.length,
      circularDependencyCount: circularDependencies.length,
      criticalModuleCount,
      summary: `${modules.length} modules, ${edges.length} dependencies, ${hotspots.length} hotspots, ${circularDependencies.length} circular dependencies.`,
      metrics: {
        moduleCount: modules.length,
        symbolCount: symbols.length,
        dependencyCount: edges.length,
        internalDependencyCount: internalEdges.length,
        dependencyDensity,
        entryPoints,
        serviceBoundaries,
        relationships,
        modules,
        hotspots,
        circularDependencies,
      },
      generatedAt: new Date(),
    };
  }

  static async generate({ repositoryId, repositoryName, session } = {}) {
    const [symbols, edges] = await Promise.all([
      IndexedSymbol.find({ repositoryId }).session(session || null).lean(),
      DependencyGraph.find({ repositoryId }).session(session || null).lean(),
    ]);

    return this.build({ repositoryId, repositoryName, symbols, edges });
  }

  static async generateAndPersist({ repositoryId, repositoryName, session } = {}) {
    const analysis = await this.generate({ repositoryId, repositoryName, session });
    await ArchitectureAnalysis.deleteMany({ repositoryId }, { session });
    const [document] = await ArchitectureAnalysis.create([analysis], { session });
    return document;
  }
}

export default ArchitectureMapping;
