import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-theme-bg text-theme-text flex items-center justify-center p-4">
          <div className="w-full max-w-md border-4 border-brand-black bg-theme-surface shadow-label-night p-6">
            {/* Warning Badge */}
            <div className="inline-block bg-brand-yellow text-brand-black font-heading font-black text-xs uppercase px-2 py-0.5 mb-3 tracking-wider">
              System Interruption
            </div>

            <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-theme-text mb-2">
              Something went wrong
            </h1>

            <p className="text-xs text-theme-text-secondary leading-relaxed mb-4">
              An unexpected render error occurred in the nutritional calculator interface. Your saved settings and daily budget have been preserved safely in local storage.
            </p>

            {this.state.error && (
              <div className="bg-theme-bg border border-theme-border p-3 mb-4 rounded font-mono text-[11px] text-verdict-heavy overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 bg-brand-yellow text-brand-black font-heading font-black text-xs uppercase py-2.5 px-4 text-center hover:bg-[#E5C000] active:scale-[0.99] transition border-2 border-brand-black"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 border-2 border-theme-border bg-theme-surface text-theme-text font-bold text-xs uppercase py-2.5 px-4 text-center hover:border-brand-yellow transition"
              >
                Return to Home
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-theme-border text-center">
              <span className="text-[10px] text-theme-text-muted font-bold uppercase tracking-wider">
                Estimates only, not medical advice.
              </span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

