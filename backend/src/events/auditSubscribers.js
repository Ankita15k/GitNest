import eventEmitter from './eventEmitter.js';
import { devLog } from '../utils/devLogger.js';
import { logAuditEvent } from '../utils/logAuditEvent.js';
import { appendToDeadLetterQueue } from '../utils/deadLetterQueue.js';

export const registerAuditSubscribers = () => {
  eventEmitter.on('REPO_CREATED', async ({ actorId, repositoryId, repoName, visibility }) => {
    try {
      await logAuditEvent({
        actorId,
        actionType: 'repo.create',
        repositoryId,
        metadata: { repoName, visibility },
      });
    } catch (error) {
      devLog('[audit-subscriber] REPO_CREATED failed', { error: error.message, actorId, repositoryId });
      await appendToDeadLetterQueue('REPO_CREATED', { actorId, repositoryId, repoName, visibility });
    }
  });

  eventEmitter.on('REPO_UPDATED', async ({ actorId, repositoryId, repoName, changes }) => {
    try {
      await logAuditEvent({
        actorId,
        actionType: 'repo.update',
        repositoryId,
        metadata: { repoName, changes },
      });
    } catch (error) {
      devLog('[audit-subscriber] REPO_UPDATED failed', { error: error.message, actorId, repositoryId });
      await appendToDeadLetterQueue('REPO_UPDATED', { actorId, repositoryId, repoName, changes });
    }
  });

  eventEmitter.on('REPO_DELETED', async ({ actorId, repositoryId, repoName }) => {
    try {
      await logAuditEvent({
        actorId,
        actionType: 'repo.delete',
        repositoryId,
        metadata: { repoName },
      });
    } catch (error) {
      devLog('[audit-subscriber] REPO_DELETED failed', { error: error.message, actorId, repositoryId });
      await appendToDeadLetterQueue('REPO_DELETED', { actorId, repositoryId, repoName });
    }
  });

  eventEmitter.on(
    'BRANCH_PROTECTION_CREATED',
    async ({ actorId, repositoryId, repoName, branch, rules }) => {
      try {
        await logAuditEvent({
          actorId,
          actionType: 'branch_protection.create',
          repositoryId,
          metadata: { repoName, branch, rules },
        });
      } catch (error) {
        devLog('[audit-subscriber] BRANCH_PROTECTION_CREATED failed', { error: error.message, actorId, repositoryId });
        await appendToDeadLetterQueue('BRANCH_PROTECTION_CREATED', { actorId, repositoryId, repoName, branch, rules });
      }
    },
  );

  eventEmitter.on(
    'BRANCH_PROTECTION_UPDATED',
    async ({ actorId, repositoryId, repoName, branch, ruleId, changes }) => {
      try {
        await logAuditEvent({
          actorId,
          actionType: 'branch_protection.update',
          repositoryId,
          metadata: { repoName, branch, ruleId, changes },
        });
      } catch (error) {
        devLog('[audit-subscriber] BRANCH_PROTECTION_UPDATED failed', { error: error.message, actorId, repositoryId });
        await appendToDeadLetterQueue('BRANCH_PROTECTION_UPDATED', { actorId, repositoryId, repoName, branch, ruleId, changes });
      }
    },
  );

  eventEmitter.on(
    'BRANCH_PROTECTION_DELETED',
    async ({ actorId, repositoryId, repoName, branch, ruleId }) => {
      try {
        await logAuditEvent({
          actorId,
          actionType: 'branch_protection.delete',
          repositoryId,
          metadata: { repoName, branch, ruleId },
        });
      } catch (error) {
        devLog('[audit-subscriber] BRANCH_PROTECTION_DELETED failed', { error: error.message, actorId, repositoryId });
        await appendToDeadLetterQueue('BRANCH_PROTECTION_DELETED', { actorId, repositoryId, repoName, branch, ruleId });
      }
    },
  );

  eventEmitter.on('USER_LOGGED_IN', async ({ actorId, email }) => {
    try {
      await logAuditEvent({
        actorId,
        actionType: 'auth.login',
        metadata: { email },
      });
    } catch (error) {
      devLog('[audit-subscriber] USER_LOGGED_IN failed', { error: error.message, actorId });
      await appendToDeadLetterQueue('USER_LOGGED_IN', { actorId, email });
    }
  });
};
