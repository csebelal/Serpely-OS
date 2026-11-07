import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Bug, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[Application ErrorBoundary Caught Error]:', error, errorInfo);
  }

  private handleReload = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleHardReload = () => {
    window.location.reload();
  };

  private handleClearCache = () => {
    try {
      localStorage.removeItem('serpely_persisted_state');
      localStorage.removeItem('sincly_active_view');
    } catch (e) {
      // Ignore storage errors
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md rounded-2xl border border-red-500/20 my-4 shadow-2xl">
          <div className="max-w-lg w-full text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400 shadow-inner">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {this.props.fallbackTitle || 'Something interrupted this workspace view'}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                An unexpected runtime error occurred while rendering this module. Your data in PostgreSQL remains secure.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Try Recovering
              </button>

              <button
                onClick={this.handleHardReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Page
              </button>

              <button
                onClick={this.handleClearCache}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
                title="Clears local browser cache and reloads without affecting database"
              >
                Clear Local Cache
              </button>
            </div>

            {/* Collapsible Error Diagnostics */}
            <div className="pt-2 text-left">
              <button
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors mx-auto cursor-pointer"
              >
                <Bug className="w-3.5 h-3.5" />
                <span>{this.state.showDetails ? 'Hide' : 'View'} Diagnostic Details</span>
                {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-48 space-y-2">
                  <div className="text-red-400 font-semibold">
                    {this.state.error?.name}: {this.state.error?.message}
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-slate-500 text-[11px] whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
