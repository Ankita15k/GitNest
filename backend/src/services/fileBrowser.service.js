import fs from 'fs';
import path from 'path';

const MAX_TREE_DEPTH = 50;
const buildTree = (directoryPath, visited = new Set(), depth = 0) => {
  if (depth > MAX_TREE_DEPTH) {
    return [];
  }

  const realPath = fs.realpathSync(directoryPath);

  if (visited.has(realPath)) {
    return [];
  }

  visited.add(realPath);
  const items = fs.readdirSync(directoryPath);

  return items
    .filter((item) => item !== '.git')
    .map((item) => {
      const fullPath = path.join(directoryPath, item);

      const stats = fs.lstatSync(fullPath);
      if (stats.isSymbolicLink()) {
        return null;
      }
      if (stats.isDirectory()) {
        return {
          name: item,
          type: 'directory',
          children: buildTree(fullPath, visited, depth + 1),
        };
      }

      return {
        name: item,
        type: 'file',
      };
    })
    .filter(Boolean);
};

export const buildRepositoryTree = async (
  userId,
  repoName
) => {
  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    userId,
    repoName
  );

  if (!fs.existsSync(repoPath)) {
    throw new Error('Repository directory not found!!');
  }

  return buildTree(repoPath);
};

export const getRepositoryFileContent = async (userId, repoName, filePath) => {
  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    userId,
    repoName
  );

  if (!fs.existsSync(repoPath)) {
    throw new Error('Repository directory not found!!');
  }

  const absolutePath = path.resolve(repoPath, filePath);
  if (!absolutePath.startsWith(repoPath)) {
    const error = new Error('Path traversal detected');
    error.statusCode = 403;
    throw error;
  }

  if (!fs.existsSync(absolutePath)) {
    const error = new Error('File not found');
    error.statusCode = 404;
    throw error;
  }

  const stats = fs.statSync(absolutePath);
  if (stats.isDirectory()) {
    const error = new Error('Path is a directory');
    error.statusCode = 400;
    throw error;
  }

  return fs.readFileSync(absolutePath, 'utf8');
};