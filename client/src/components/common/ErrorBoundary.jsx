import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    const msg = error?.message || '';
    const isChunkError =
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Loading chunk') ||
      msg.includes('Loading CSS chunk') ||
      msg.includes('Importing a module script failed');

    return { hasError: true, error, isChunkError };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);

    // Auto-retry once for chunk/dynamic-import errors (Vite HMR issue)
    const msg = error?.message || '';
    if (
      (msg.includes('Failed to fetch dynamically imported module') ||
       msg.includes('Loading chunk')) &&
      !sessionStorage.getItem('ves_chunk_retry')
    ) {
      sessionStorage.setItem('ves_chunk_retry', '1');
      window.location.reload();
    }
  }

  handleReload = () => {
    sessionStorage.removeItem('ves_chunk_retry');
    window.location.reload();
  };

  handleGoHome = () => {
    sessionStorage.removeItem('ves_chunk_retry');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}>
          <div className="text-center max-w-md w-full">
            {/* Animated illustration */}
            <div className="relative mb-8">
              <div className="w-28 h-28 mx-auto rounded-3xl flex items-center justify-center text-5xl"
                style={{
                  background: this.state.isChunkError
                    ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: this.state.isChunkError
                    ? '0 8px 32px rgba(251,191,36,0.3)'
                    : '0 8px 32px rgba(239,68,68,0.3)',
                  animation: 'float 3s ease-in-out infinite',
                }}>
                {this.state.isChunkError ? '🔄' : '⚠️'}
              </div>
            </div>

            {/* Card */}
            <div className="bg-white rounded-[24px] p-8 shadow-lg" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
              <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#1e293b' }}>
                {this.state.isChunkError ? 'Page Loading Failed' : 'Something Went Wrong'}
              </h2>

              <p className="text-sm leading-relaxed mb-6" style={{ color: '#64748b' }}>
                {this.state.isChunkError
                  ? 'A new version of VedhaEduSpark is available. The page needs to be refreshed to load the latest files.'
                  : 'An unexpected error occurred. This might be a temporary issue — please try reloading.'}
              </p>

              {/* Error detail (collapsed) */}
              {this.state.error?.message && (
                <div className="mb-6 p-3 rounded-xl text-left" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <p className="text-[0.65rem] font-mono leading-relaxed break-all" style={{ color: '#b91c1c' }}>
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={this.handleReload}
                  className="w-full py-3 px-6 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  }}>
                  🔄 Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all hover:bg-gray-100"
                  style={{ color: '#64748b', background: '#f1f5f9' }}>
                  🏠 Go to Home
                </button>
              </div>
            </div>

            {/* Footer tip */}
            <p className="mt-6 text-xs" style={{ color: '#94a3b8' }}>
              If this keeps happening, try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
