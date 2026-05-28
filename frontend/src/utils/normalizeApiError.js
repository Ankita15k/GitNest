import { isRetryableError } from './isRetryableError.js';

/**
 * Normalizes axios and network errors into a consistent shape for UI layers.
 */
export const normalizeApiError = (error) => {
  const data = error?.response?.data;

  if (!error?.response) {
    const networkError = new Error(
      error?.request
        ? 'No response received from the server. Please check your connection and try again.'
        : error?.message || 'An unexpected error occurred while making the request.'
    );
    networkError.code = 'NETWORK_ERROR';
    networkError.requestId = null;
    networkError.errors = [];
    networkError.status = null;
    networkError.retryable = true;
    networkError.cause = error;
    return networkError;
  }

  const normalized = new Error(
    data?.message || `Request failed with status ${error.response.status}`
  );

  normalized.code = data?.code || 'API_ERROR';
  normalized.requestId = data?.requestId || error.response?.headers?.['x-request-id'] || null;
  normalized.errors = Array.isArray(data?.errors) ? data.errors : [];
  normalized.status = data?.statusCode || error.response.status;
  normalized.retryable = isRetryableError({
    code: normalized.code,
    status: normalized.status,
    response: error.response,
  });
  normalized.cause = error;

  return normalized;
};

export default normalizeApiError;
