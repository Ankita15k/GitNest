import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-gray-700">
            <div className="mx-auto bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              An unexpected error occurred in the application. We've logged this issue and are looking into it.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-8 text-left">
                <p className="text-red-400 font-mono text-sm mb-2">{this.state.error.toString()}</p>
                <pre className="text-gray-500 text-xs overflow-auto bg-gray-900 p-4 rounded border border-gray-700 max-h-48">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
