import path from 'path';
import DependencyGraph from '../models/DependencyGraph.model.js';
import { isSupportedSourceFile } from './symbolExtractor.js';

const EXTENSIONS = ['', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

const normalizePath = (value = '') => value.replace(/\\/g, '/').replace(/^\.\//, '');

const packageNameFor = (source) => (source.startsWith('@') ? source.split('/').slice(0, 2).join('/') : source.split('/')[0]);

const lineNumberFor = (content, index) => content.slice(0, index).split('\n').length;

const resolveInternalTarget = (fromFile, importSource, knownFiles) => {
  if (!importSource.startsWith('.')) return null;

  const base = normalizePath(path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), importSource)));
  for (const ext of EXTENSIONS) {
    const candidate = normalizePath(`${base}${ext}`);
    if (knownFiles.has(candidate)) return candidate;
  }

  for (const ext of EXTENSIONS.slice(1)) {
    const candidate = normalizePath(`${base}/index${ext}`);
    if (knownFiles.has(candidate)) return candidate;
  }

  return base;
};

const pushEdge = (edges, edge) => {
  const key = [
    edge.filePath,
    edge.sourceSymbol,
    edge.sourceType,
    edge.targetSymbol,
    edge.targetType,
    edge.dependencyType,
  ].join('|');

  if (!edges.seen.has(key)) {
    edges.seen.add(key);
    edges.items.push(edge);
  }
};

export const extractDependencyEdgesFromFiles = (files, symbols = []) => {
  const supportedFiles = files.filter((file) => isSupportedSourceFile(file.path));
  const knownFiles = new Set(supportedFiles.map((file) => normalizePath(file.path)));
  const symbolsByFile = symbols.reduce((acc, symbol) => {
    const filePath = normalizePath(symbol.filePath);
    acc.set(filePath, [...(acc.get(filePath) || []), symbol]);
    return acc;
  }, new Map());
  const edges = { seen: new Set(), items: [] };

  for (const file of supportedFiles) {
    const filePath = normalizePath(file.path);
    const content = file.content || '';

    for (const symbol of symbolsByFile.get(filePath) || []) {
      if (symbol.symbolType === 'export') {
        pushEdge(edges, {
          filePath,
          sourceSymbol: filePath,
          sourceType: 'module',
          targetSymbol: symbol.exportName || symbol.symbolName,
          targetType: 'symbol',
          dependencyType: 'export',
          metadata: { line: symbol.line },
        });
      }
    }

    const importRegex = /\bimport\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]|\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    for (const match of content.matchAll(importRegex)) {
      const importSource = match[1] || match[2];
      const targetFile = resolveInternalTarget(filePath, importSource, knownFiles);
      const isInternal = Boolean(targetFile);
      pushEdge(edges, {
        filePath,
        sourceSymbol: filePath,
        sourceType: 'module',
        targetSymbol: isInternal ? targetFile : packageNameFor(importSource),
        targetType: isInternal ? 'module' : 'package',
        dependencyType: isInternal ? 'internal_import' : 'external_import',
        metadata: { importSource, line: lineNumberFor(content, match.index || 0), targetFile },
      });
    }

    const routeRegex = /\b(?:app|router)\s*\.\s*(get|post|put|patch|delete|use)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([A-Za-z_$][\w$]*)/g;
    for (const match of content.matchAll(routeRegex)) {
      pushEdge(edges, {
        filePath,
        sourceSymbol: `${match[1].toUpperCase()} ${match[2]}`,
        sourceType: 'route',
        targetSymbol: match[3],
        targetType: 'handler',
        dependencyType: 'route_handler',
        metadata: { method: match[1].toUpperCase(), route: match[2], line: lineNumberFor(content, match.index || 0) },
      });
    }

    const layerRegex = /\b([A-Za-z_$][\w$]*(?:Service|Controller))\b/g;
    for (const match of content.matchAll(layerRegex)) {
      pushEdge(edges, {
        filePath,
        sourceSymbol: filePath,
        sourceType: filePath.includes('controller') ? 'controller' : 'module',
        targetSymbol: match[1],
        targetType: match[1].endsWith('Service') ? 'service' : 'controller',
        dependencyType: 'layer_reference',
        metadata: { line: lineNumberFor(content, match.index || 0) },
      });
    }
  }

  return edges.items;
};

export class DependencyGraphBuilder {
  static async replaceEdges({ repositoryId, edges = [], session } = {}) {
    await DependencyGraph.deleteMany({ repositoryId }, { session });

    const documents = edges.map((edge) => ({
      repositoryId,
      ...edge,
      createdAt: new Date(),
    }));

    if (documents.length > 0) {
      await DependencyGraph.insertMany(documents, { session, ordered: false });
    }

    return { edgeCount: documents.length };
  }

  static async rebuild({ repositoryId, files, symbols = [], session } = {}) {
    const edges = extractDependencyEdgesFromFiles(files || [], symbols);
    return this.replaceEdges({ repositoryId, edges, session });
  }
}

export { normalizePath };
