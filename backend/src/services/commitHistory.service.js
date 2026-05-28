import path from 'path';
import simpleGit from 'simple-git';

export const getCommitHistory = async (
  userId,
  repoName,
  page = 1,
  limit = 10
) => {
  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    userId,
    repoName
  );

  const git = simpleGit(repoPath);

  const skip = (page - 1) * limit;

  const log = await git.log({
    '--skip': skip,
    '--max-count': limit,
  });

  const commits = log.all.map((commit) => ({
    hash: commit.hash,
    message: commit.message,
    author: commit.author_name,
    date: commit.date,
  }));

  return {
    commits,
    total: log.total,
    page,
    limit,
  };
};
