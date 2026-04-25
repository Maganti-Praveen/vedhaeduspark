import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gray-50)' }}>
          <div className="text-center p-10 bg-white rounded-[20px] shadow-lg max-w-md mx-4" style={{ border: '1px solid var(--gray-200)' }}>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--gray-900)' }}>
              Something went wrong
            </h2>
            <p className="mb-6" style={{ color: 'var(--gray-500)' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
