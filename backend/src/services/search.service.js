import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';
import Repository from '../models/Repository.model.js';

const REPOSITORIES_ROOT = path.resolve(process.cwd(), 'repositories');

const getVisibleRepositories = (userId) =>
  Repository.find(
    userId
      ? { $or: [{ visibility: 'public' }, { owner: userId }] }
      : { visibility: 'public' }
  )
    .select('name owner')
    .lean();

const walkDirectory = (dir, query, repoName, rootDir, results) => {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.name.toLowerCase().includes(query)) {
      results.push({
        repository: repoName,
        path: path.relative(rootDir, fullPath),
        type: entry.isDirectory() ? 'directory' : 'file',
      });
    }

    if (entry.isDirectory()) {
      walkDirectory(fullPath, query, repoName, rootDir, results);
    }
  }
};

export const searchFiles = async (query, userId, skip = 0, limit = 10) => {
  const repositories = await getVisibleRepositories(userId);
  const results = [];

  query = query.toLowerCase();

  for (const repository of repositories) {
    const repoPath = path.join(
      REPOSITORIES_ROOT,
      repository.owner.toString(),
      repository.name
    );

    walkDirectory(
      repoPath,
      query,
      repository.name,
      repoPath,
      results
    );
  }

  return {
    items: results.slice(skip, skip + limit),
    count: results.length,
  };
};

export const searchCommits = async (query, userId, skip = 0, limit = 10) => {
  const repositories = await getVisibleRepositories(userId);
  const results = [];

  query = query.toLowerCase();

  for (const repository of repositories) {
    const repoPath = path.join(
      REPOSITORIES_ROOT,
      repository.owner.toString(),
      repository.name
    );

    if (!fs.existsSync(repoPath)) continue;

    try {
      const { all } = await simpleGit(repoPath).log({
        '--max-count': 100,
      });

      results.push(
        ...all
          .filter(commit =>
            commit.message.toLowerCase().includes(query)
          )
          .map(commit => ({
            repository: repository.name,
            hash: commit.hash,
            message: commit.message,
            author: commit.author_name,
            date: commit.date,
          }))
      );
    } catch {
    }
  }

  return {
    items: results.slice(skip, skip + limit),
    count: results.length,
  };
};
