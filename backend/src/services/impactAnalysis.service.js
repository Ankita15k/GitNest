import DependencyGraph from '../models/DependencyGraph.model.js';
import { normalizePath } from './dependencyGraphBuilder.service.js';

const edgeFileTargets = (edge) => [edge.targetSymbol, edge.metadata?.targetFile].filter(Boolean);

export class ImpactAnalysis {
  static async analyze({ repositoryId, file, symbol, maxDepth = 3 }) {
    const edges = await DependencyGraph.find({ repositoryId }).lean();
    const seed = symbol || (file ? normalizePath(file) : null);
    const fileSeed = file ? normalizePath(file) : null;

    const matchesSource = (edge, value = seed) =>
      value && (edge.sourceSymbol === value || edge.filePath === value || edge.sourceSymbol.includes(value));
    const matchesTarget = (edge, value = seed) =>
      value && (edge.targetSymbol === value || edge.metadata?.targetFile === value || edge.targetSymbol.includes(value));

    const directDependencies = edges.filter((edge) => matchesSource(edge) || (fileSeed && edge.filePath === fileSeed));
    const directDependents = edges.filter((edge) => matchesTarget(edge) || edgeFileTargets(edge).includes(fileSeed));

    const visited = new Set([seed].filter(Boolean));
    const queue = [{ value: seed, depth: 0 }].filter((item) => item.value);
    const affectedSymbols = new Set();
    const affectedFiles = new Set();
    const depthSummary = {};

    while (queue.length > 0) {
      const { value, depth } = queue.shift();
      if (depth >= maxDepth) continue;

      const dependents = edges.filter((edge) => matchesTarget(edge, value));
      for (const edge of dependents) {
        const next = edge.sourceSymbol;
        const nextDepth = depth + 1;
        affectedSymbols.add(edge.sourceSymbol);
        affectedFiles.add(edge.filePath);
        depthSummary[nextDepth] = (depthSummary[nextDepth] || 0) + 1;

        if (!visited.has(next)) {
          visited.add(next);
          queue.push({ value: next, depth: nextDepth });
        }
      }
    }

    return {
      seed: { file: fileSeed, symbol: symbol || null },
      directDependencies,
      directDependents,
      affectedSymbols: [...affectedSymbols],
      affectedFiles: [...affectedFiles],
      depthSummary,
    };
  }
}
