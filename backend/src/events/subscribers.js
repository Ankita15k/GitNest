import eventEmitter from './eventEmitter.js';
import ACTIVITY_TYPES from '../constants/activityTypes.js';
import { logActivitySafely } from '../utils/logActivitySafely.js';

// Subscribe to USER_FOLLOWED domain event
eventEmitter.on('USER_FOLLOWED', async ({ actorId, targetId, targetUsername }) => {
  await logActivitySafely({
    actor: actorId,
    type: ACTIVITY_TYPES.USER_FOLLOWED,
    targetUser: targetId,
    metadata: { targetUsername },
  });
});

// Subscribe to USER_UNFOLLOWED domain event
eventEmitter.on('USER_UNFOLLOWED', async ({ actorId, targetId, targetUsername }) => {
  await logActivitySafely({
    actor: actorId,
    type: ACTIVITY_TYPES.USER_UNFOLLOWED,
    targetUser: targetId,
    metadata: { targetUsername },
  });
});

// Subscribe to REPOSITORY_STARRED domain event
eventEmitter.on('REPOSITORY_STARRED', async ({ actorId, repoId, repoName }) => {
  await logActivitySafely({
    actor: actorId,
    type: ACTIVITY_TYPES.REPOSITORY_STARRED,
    repository: repoId,
    metadata: { repoName },
  });
});

// Subscribe to REPOSITORY_UNSTARRED domain event
eventEmitter.on('REPOSITORY_UNSTARRED', async ({ actorId, repoId, repoName }) => {
  await logActivitySafely({
    actor: actorId,
    type: ACTIVITY_TYPES.REPOSITORY_UNSTARRED,
    repository: repoId,
    metadata: { repoName },
  });
});

// Subscribe to REPOSITORY_FORKED domain event
eventEmitter.on('REPOSITORY_FORKED', async ({ actorId, repoId, repoName }) => {
  await logActivitySafely({
    actor: actorId,
    type: ACTIVITY_TYPES.REPOSITORY_FORKED,
    repository: repoId,
    metadata: { repoName },
  });
});

// Subscribe to PULL_REQUEST_MERGED domain event
eventEmitter.on('PULL_REQUEST_MERGED', async ({ actorId, repoId, prNumber, prTitle }) => {
  await logActivitySafely({
    actor: actorId,
    type: ACTIVITY_TYPES.PULL_REQUEST_MERGED,
    repository: repoId,
    metadata: { prNumber, prTitle },
  });
});

export default eventEmitter;
