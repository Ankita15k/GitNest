import ErrorBoundary from './ErrorBoundary.jsx';
import SectionErrorFallback from './SectionErrorFallback.jsx';

/**
 * Isolates render failures to a page section without affecting shell/navigation.
 */
const SectionErrorBoundary = ({ children, title, message }) => {
  const fallback = (props) => (
    <SectionErrorFallback {...props} title={title} message={message} />
  );

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
};

export default SectionErrorBoundary;
