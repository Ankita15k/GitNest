import ErrorState from './ErrorState.jsx';

/**
 * Compact fallback for sectional ErrorBoundary — not full-page.
 */
const SectionErrorFallback = ({
  error,
  onReset,
  title = 'This section encountered an error',
  message,
}) => (
  <ErrorState
    title={title}
    message={message || error?.message || 'Something went wrong while rendering this section.'}
    onRetry={onReset}
    retryLabel="Try again"
    variant="danger"
  />
);

export default SectionErrorFallback;
