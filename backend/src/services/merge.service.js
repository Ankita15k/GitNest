import path from 'path';
import simpleGit from 'simple-git';

const getGitInstance = (userId, repoName) => {
  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    userId,
    repoName
  );

  return simpleGit(repoPath);
};

export const mergeBranches = async (
  userId,
  repoName,
  sourceBranch,
  targetBranch
) => {
  if (sourceBranch === targetBranch) {
    throw new Error(
      'Source and target branches cannot be the same'
    );
  }

  const git = getGitInstance(userId, repoName);
  const branches = await git.branchLocal();

  if (!branches.all.includes(sourceBranch)) {
    throw new Error(
      `Source branch "${sourceBranch}" does not exist`
    );
  }

  if (!branches.all.includes(targetBranch)) {
    throw new Error(
      `Target branch "${targetBranch}" does not exist`
    );
  }

  await git.checkout(targetBranch);

  try {
    const result = await git.merge([sourceBranch]);

    return {
      merged: true,
      summary: result.summary,
    };
  } catch {
    let conflicts = [];

    try {
      const status = await git.status();

      conflicts = status.conflicted || [];

      await git.merge(['--abort']);
    } catch {
      // ignore cleanup errors
    }

    return {
      merged: false,
      hasConflicts: true,
      conflicts,
    };
  }
};
