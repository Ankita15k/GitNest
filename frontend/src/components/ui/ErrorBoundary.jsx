import { Component } from 'react';
import FatalErrorFallback from './FatalErrorFallback.jsx';
import SectionErrorFallback from './SectionErrorFallback.jsx';

/**
 * App-level boundary: use FatalErrorFallback (full-page reload).
 * Section-level: use SectionErrorBoundary instead.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback, level = 'app' } = this.props;

    if (hasError) {
      if (Fallback) {
        return (
          <Fallback
            error={error}
            onReset={this.handleReset}
            onReload={this.handleReload}
          />
        );
      }

      if (level === 'section') {
        return (
          <SectionErrorFallback
            error={error}
            onReset={this.handleReset}
          />
        );
      }

      return (
        <FatalErrorFallback
          error={error}
          onReload={this.handleReload}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
