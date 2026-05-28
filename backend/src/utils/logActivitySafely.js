import { logActivity } from '../services/activity.service.js';
import { devLog } from './devLogger.js';

/**
 * Wraps activity logging so failures never block the primary operation.
 */
export const logActivitySafely = async (activityPayload) => {
  try {
    await logActivity(activityPayload);
  } catch (error) {
    devLog('[activity-log]', error?.message || error);
  }
};

export default logActivitySafely;
