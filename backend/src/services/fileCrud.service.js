import fs from 'fs';
import path from 'path';

const getRepositoryPath = (userId, repoName) =>
  path.resolve(
    process.cwd(),
    'repositories',
    userId,
    repoName
  );

const resolveSafePath = (repoPath, filePath) => {
  const absolutePath = path.resolve(repoPath, filePath);

  if (!absolutePath.startsWith(repoPath)) {
    const error = new Error('Path traversal detected');
    error.statusCode = 403;
    throw error;
  }

  if (
    absolutePath.includes(`${path.sep}.git${path.sep}`) ||
    absolutePath.endsWith(`${path.sep}.git`) ||
    path.basename(absolutePath) === '.git'
  ) {
    const error = new Error('Access to .git directory is forbidden');
    error.statusCode = 403;
    throw error;
  }

  return absolutePath;
};

export const createRepositoryFile = async (
  userId,
  repoName,
  filePath,
  content
) => {
  const repoPath = getRepositoryPath(userId, repoName);

  const absolutePath = resolveSafePath(repoPath, filePath);

  if (fs.existsSync(absolutePath)) {
    const error = new Error('File already exists');
    error.statusCode = 409;
    throw error;
  }

  fs.mkdirSync(path.dirname(absolutePath), {
    recursive: true,
  });

  fs.writeFileSync(
    absolutePath,
    content ?? '',
    'utf8'
  );

  return {
    path: filePath,
  };
};

export const updateRepositoryFile = async (
  userId,
  repoName,
  filePath,
  content
) => {
  const repoPath = getRepositoryPath(userId, repoName);

  const absolutePath = resolveSafePath(repoPath, filePath);

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

  fs.writeFileSync(
    absolutePath,
    content ?? '',
    'utf8'
  );

  return {
    path: filePath,
  };
};

export const deleteRepositoryFile = async (
  userId,
  repoName,
  filePath
) => {
  const repoPath = getRepositoryPath(userId, repoName);

  const absolutePath = resolveSafePath(repoPath, filePath);

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

  fs.unlinkSync(absolutePath);

  return {
    path: filePath,
  };
};
