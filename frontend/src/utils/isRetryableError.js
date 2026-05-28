const NON_RETRYABLE_CODES = new Set([
  'VALIDATION_ERROR',
  'AUTH_ERROR',
  'NOT_FOUND',
  'RATE_LIMITED',
]);

const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404, 422, 429]);

/**
 * Determines whether a failed request should be retried.
 */
export const isRetryableError = (error) => {
  if (!error) return false;

  if (typeof error.retryable === 'boolean') {
    return error.retryable;
  }

  if (error.code && NON_RETRYABLE_CODES.has(error.code)) {
    return false;
  }

  const status = error.status ?? error.response?.status;

  if (status && NON_RETRYABLE_STATUSES.has(status)) {
    return false;
  }

  if (!error.response) {
    return true;
  }

  if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
    return true;
  }

  return status >= 500;
};

export default isRetryableError;
