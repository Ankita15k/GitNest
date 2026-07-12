import path from 'path';
import simpleGit from 'simple-git';

export const compareBranches = async (
  ownerId,
  repoName,
  sourceBranch,
  targetBranch
) => {
  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    ownerId,
    repoName
  );

  const git = simpleGit(repoPath);

  const diffSummary = await git.diffSummary([
    `${targetBranch}...${sourceBranch}`,
  ]);

  const rawDiff = await git.diff([
    `${targetBranch}...${sourceBranch}`,
  ]);

  return {
    sourceBranch,
    targetBranch,
    changedFiles: diffSummary.files,
    filesChanged: diffSummary.changed,
    insertions: diffSummary.insertions,
    deletions: diffSummary.deletions,
    diff: rawDiff,
  };
};
