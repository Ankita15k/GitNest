/**
 * Exponential backoff delay for retries (capped at 30s).
 */
export const getRetryDelay = (attemptIndex, baseDelayMs = 1000) =>
  Math.min(baseDelayMs * 2 ** attemptIndex, 30000);

export default getRetryDelay;
