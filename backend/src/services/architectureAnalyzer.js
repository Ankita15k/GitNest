import fs from 'fs';
import path from 'path';

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '__pycache__',
  'coverage',
]);

const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb']);
const IMPORT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.py'];

const normalizeRelativePath = (filePath) => filePath.split(path.sep).join('/');

function extractImports(content, filePath) {
  const imports = [];
  const ext = path.extname(filePath);

  if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    const patterns = [
      /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push(match[1]);
      }
    });
  }

  if (ext === '.py') {
    const patterns = [
      /^import\s+(\S+)/gm,
      /^from\s+(\S+)\s+import/gm,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push(match[1]);
      }
    });
  }

  return imports;
}

function buildFileTree(dirPath, repoRoot, maxDepth = 4, currentDepth = 0) {
  if (currentDepth >= maxDepth) return [];

  const nodes = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue;

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = normalizeRelativePath(path.relative(repoRoot, fullPath));

      if (entry.isDirectory()) {
        nodes.push({
          id: relativePath,
          name: entry.name,
          type: 'directory',
          children: buildFileTree(fullPath, repoRoot, maxDepth, currentDepth + 1),
        });
        continue;
      }

      const ext = path.extname(entry.name);
      if (CODE_EXTENSIONS.has(ext)) {
        nodes.push({
          id: relativePath,
          name: entry.name,
          type: 'file',
          ext,
        });
      }
    }
  } catch {
    return nodes;
  }

  return nodes;
}

function resolveRelativeImport(fullPath, importPath, repoRoot) {
  const basePath = path.resolve(path.dirname(fullPath), importPath);
  const candidates = [basePath];

  if (!path.extname(basePath)) {
    IMPORT_EXTENSIONS.forEach((ext) => {
      candidates.push(`${basePath}${ext}`);
      candidates.push(path.join(basePath, `index${ext}`));
    });
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return normalizeRelativePath(path.relative(repoRoot, candidate));
    }
  }

  return null;
}

function buildDependencyGraph(dirPath, repoRoot) {
  const nodes = new Map();
  const edges = [];

  function walk(currentPath) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        if (IGNORE_DIRS.has(entry.name)) continue;

        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          walk(fullPath);
          continue;
        }

        const ext = path.extname(entry.name);
        if (!CODE_EXTENSIONS.has(ext)) continue;

        const relativePath = normalizeRelativePath(path.relative(repoRoot, fullPath));
        const content = fs.readFileSync(fullPath, 'utf-8');
        const imports = extractImports(content, fullPath);

        if (!nodes.has(relativePath)) {
          nodes.set(relativePath, {
            id: relativePath,
            name: entry.name,
            type: 'file',
            ext,
            importCount: 0,
            importedByCount: 0,
            size: content.length,
          });
        }

        imports
          .filter((importPath) => importPath.startsWith('.'))
          .forEach((importPath) => {
            const resolved = resolveRelativeImport(fullPath, importPath, repoRoot);

            if (!resolved) return;

            edges.push({ source: relativePath, target: resolved });
            const sourceNode = nodes.get(relativePath);
            if (sourceNode) sourceNode.importCount += 1;

            if (!nodes.has(resolved) && fs.existsSync(path.join(repoRoot, resolved))) {
              const targetContent = fs.readFileSync(path.join(repoRoot, resolved), 'utf-8');
              nodes.set(resolved, {
                id: resolved,
                name: path.basename(resolved),
                type: 'file',
                ext: path.extname(resolved),
                importCount: 0,
                importedByCount: 0,
                size: targetContent.length,
              });
            }

            const targetNode = nodes.get(resolved);
            if (targetNode) targetNode.importedByCount += 1;
          });
      }
    } catch {
      // Ignore unreadable paths and keep the analysis moving.
    }
  }

  walk(dirPath);
  return { nodes: Array.from(nodes.values()), edges };
}

function detectHotspots(nodes, edges) {
  const inbound = {};

  edges.forEach((edge) => {
    inbound[edge.target] = (inbound[edge.target] || 0) + 1;
  });

  return nodes
    .map((node) => ({
      ...node,
      connections: (inbound[node.id] || 0) + node.importCount,
    }))
    .sort((left, right) => right.connections - left.connections)
    .slice(0, 10);
}

function detectCircularDeps(edges) {
  const graph = {};

  edges.forEach((edge) => {
    if (!graph[edge.source]) graph[edge.source] = [];
    graph[edge.source].push(edge.target);
  });

  const circular = [];
  const visited = new Set();

  function dfs(node, trail, trailSet) {
    if (trailSet.has(node)) {
      const cycleStart = trail.indexOf(node);
      circular.push(trail.slice(cycleStart));
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    trailSet.add(node);

    (graph[node] || []).forEach((nextNode) => {
      dfs(nextNode, [...trail, nextNode], new Set(trailSet));
    });
  }

  Object.keys(graph).forEach((node) => dfs(node, [node], new Set([node])));

  return circular.slice(0, 5);
}

export async function analyzeRepository(repoPath) {
  const tree = buildFileTree(repoPath, repoPath);
  const { nodes, edges } = buildDependencyGraph(repoPath, repoPath);
  const hotspots = detectHotspots(nodes, edges);
  const circularDeps = detectCircularDeps(edges);

  const languages = {};
  nodes.forEach((node) => {
    const language = node.ext || 'unknown';
    languages[language] = (languages[language] || 0) + 1;
  });

  return {
    tree,
    graph: { nodes, edges },
    hotspots,
    circularDeps,
    stats: {
      totalFiles: nodes.length,
      totalEdges: edges.length,
      languages,
      avgConnections: edges.length / Math.max(nodes.length, 1),
    },
  };
}

export default analyzeRepository;