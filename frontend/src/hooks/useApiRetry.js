import { useCallback, useState } from 'react';
import { getRetryDelay } from '../utils/retryDelay.js';
import { isRetryableError } from '../utils/isRetryableError.js';
import { devLog } from '../utils/devLogger.js';

/**
 * Hook for manual retry with exponential backoff and loading state.
 */
export const useApiRetry = (retryFn, error = null) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const isRetryable = isRetryableError(error);

  const retry = useCallback(async () => {
    if (!retryFn) return;

    setIsRetrying(true);

    if (attempt > 0) {
      const delay = getRetryDelay(attempt - 1);
      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }

    try {
      if (import.meta.env.DEV && error?.requestId) {
        devLog('[retry]', error.requestId, `attempt ${attempt + 1}`);
      }
      await retryFn();
      setAttempt(0);
    } finally {
      setIsRetrying(false);
      setAttempt((prev) => prev + 1);
    }
  }, [retryFn, attempt, error?.requestId]);

  return {
    retry,
    isRetrying,
    isRetryable,
    attempt,
  };
};

export default useApiRetry;
