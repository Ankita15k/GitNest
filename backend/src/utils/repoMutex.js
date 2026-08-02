const locks = new Map();

export const acquireRepoLock = (repoPath) => {
  const key = repoPath;
  const previous = locks.get(key) ?? Promise.resolve();

  let release;

  const next = new Promise((resolve) => {
    release = resolve;
  });

  const waitAndHold = previous.then(() => {});
  .catch(err => console.error(err))