import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
          <div className="font-bold mb-2">Something went wrong.</div>
          <div>{this.state.error?.message || 'Unknown error'}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
