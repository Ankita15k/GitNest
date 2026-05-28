import { QueryClient } from '@tanstack/react-query';
import { isRetryableError } from '../utils/isRetryableError.js';
import { getRetryDelay } from '../utils/retryDelay.js';

const MAX_QUERY_RETRIES = 3;

export const shouldRetryQuery = (failureCount, error) => {
  if (!isRetryableError(error)) {
    return false;
  }
  return failureCount < MAX_QUERY_RETRIES;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: shouldRetryQuery,
      retryDelay: getRetryDelay,
    },
    mutations: {
      retry: (failureCount, error) => isRetryableError(error) && failureCount < 1,
      retryDelay: getRetryDelay,
    },
  },
});

export default queryClient;
