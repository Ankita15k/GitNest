import AuditLog from '../models/AuditLog.model.js';
import { devLog } from './devLogger.js';

export const logAuditEvent = async ({
  actorId,
  actionType,
  repositoryId = null,
  ipAddress = null,
  metadata = {},
}, retries = 3, backoff = 100) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await AuditLog.create({
        actorId,
        actionType,
        repositoryId,
        ipAddress,
        metadata,
      });
    } catch (error) {
      if (attempt === retries) {
        devLog('[audit-log]', error?.message || error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, backoff * attempt));
    }
  }
};
