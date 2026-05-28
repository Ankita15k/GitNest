import fs from 'fs';
import path from 'path';

const buildTree = (directoryPath) => {
  const items = fs.readdirSync(directoryPath);

  return items
    .filter((item) => item !== '.git')
    .map((item) => {
      const fullPath = path.join(directoryPath, item);

      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        return {
          name: item,
          type: 'directory',
          children: buildTree(fullPath),
        };
      }

      return {
        name: item,
        type: 'file',
      };
    });
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
