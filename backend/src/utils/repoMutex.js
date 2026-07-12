const locks = new Map();

export const acquireRepoLock = (repoPath) => {
  const key = repoPath;
  const previous = locks.get(key) ?? Promise.resolve();

  let release;

  const next = new Promise((resolve) => {
    release = resolve;
  });

  const waitAndHold = previous.then(() => {});

  locks.set(key, next);

  next.then(() => {
    if (locks.get(key) === next) {
      locks.delete(key);
    }
  });

  return waitAndHold.then(() => release);
};

export const _lockMapSize = () => locks.size;