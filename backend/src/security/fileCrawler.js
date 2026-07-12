import fs from 'fs';
import { readdir, stat, readFile, realpath } from 'fs/promises';
import path from 'path';

const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'build']);
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB limit for safety
const MAX_DEPTH = 20; // Maximum recursion depth
const CONCURRENCY_LIMIT = 5; // Max concurrent directory reads

// Simple utility to check if file is likely binary
const isBinary = (filePath) => {
  const binaryExtensions = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar', '.gz',
    '.mp4', '.mp3', '.exe', '.dll', '.so', '.dylib', '.woff', '.woff2',
    '.eot', '.ttf', '.map'
  ]);
  return binaryExtensions.has(path.extname(filePath).toLowerCase());
};

// Process items in batches with concurrency control
const processBatch = async (items, processor) => {
  const results = [];
  for (let i = 0; i < items.length; i += CONCURRENCY_LIMIT) {
    const batch = items.slice(i, i + CONCURRENCY_LIMIT);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults.filter(Boolean));
  }
  return results;
};

export const crawlRepositoryFiles = async (repoPath) => {
  const files = [];
  const visited = new Set();

  const walk = async (dir, depth = 0) => {
    if (depth > MAX_DEPTH) return;

    // Check if directory exists
    try {
      await stat(dir);
    } catch {
      return;
    }

    // Resolve real path to detect symlink cycles
    let realDir;
    try {
      realDir = await realpath(dir);
    } catch {
      return;
    }

    // Skip already visited — prevents symlink cycles
    if (visited.has(realDir)) return;
    visited.add(realDir);

    let items;
    try {
      items = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    // Filter out ignored dirs and symlinks upfront
    const validItems = items.filter(
      (item) => !IGNORED_DIRS.has(item.name) && !item.isSymbolicLink()
    );

    // Process in batches with concurrency control
    await processBatch(validItems, async (item) => {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        await walk(fullPath, depth + 1);
        return;
      }

      if (item.isFile()) {
        let fileStats;
        try {
          fileStats = await stat(fullPath);
        } catch {
          return;
        }

        if (fileStats.size > MAX_FILE_SIZE) return;
        if (isBinary(fullPath)) return;

        try {
          const content = await readFile(fullPath, 'utf8');
          const relativePath = path.relative(repoPath, fullPath).replace(/\\/g, '/');
          files.push({ path: relativePath, content });
        } catch {
          // Ignore read errors
        }
      }
    });
  };

  await walk(repoPath);
  return files;
};