import fs from 'fs';
import path from 'path';

const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'build']);
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB limit for safety
const MAX_DEPTH = 20; // Maximum recursion depth

// Simple utility to check if file is likely binary
const isBinary = (filePath) => {
  const binaryExtensions = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar', '.gz',
    '.mp4', '.mp3', '.exe', '.dll', '.so', '.dylib', '.woff', '.woff2',
    '.eot', '.ttf', '.map'
  ]);
  return binaryExtensions.has(path.extname(filePath).toLowerCase());
};

export const crawlRepositoryFiles = (repoPath) => {
  const files = [];
  const visited = new Set(); // Track visited real paths for cycle detection

  const walk = (dir, depth = 0) => {
    // Enforce max recursion depth
    if (depth > MAX_DEPTH) return;

    if (!fs.existsSync(dir)) return;

    // Resolve real path to detect symlink cycles
    let realDir;
    try {
      realDir = fs.realpathSync(dir);
    } catch {
      return; // Skip if path cannot be resolved
    }

    // Skip if already visited — prevents infinite symlink cycles
    if (visited.has(realDir)) return;
    visited.add(realDir);

    let items;
    try {
      items = fs.readdirSync(dir);
    } catch {
      return; // Skip unreadable directories
    }

    for (const item of items) {
      if (IGNORED_DIRS.has(item)) continue;

      const fullPath = path.join(dir, item);

      // Use lstatSync instead of statSync — does NOT follow symlinks
      let stats;
      try {
        stats = fs.lstatSync(fullPath);
      } catch {
        continue; // Skip if stat fails
      }

      // Skip symbolic links entirely to prevent cycle traversal
      if (stats.isSymbolicLink()) continue;

      if (stats.isDirectory()) {
        walk(fullPath, depth + 1);
      } else if (stats.isFile()) {
        if (stats.size > MAX_FILE_SIZE) continue;
        if (isBinary(fullPath)) continue;

        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const relativePath = path.relative(repoPath, fullPath).replace(/\\/g, '/');
          files.push({
            path: relativePath,
            content,
          });
        } catch {
          // Ignore read errors
        }
      }
    }
  };

  walk(repoPath);
  return files;
};