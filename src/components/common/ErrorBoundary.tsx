import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-rose-700"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-base font-bold text-slate-900">
                  Workspace Sync Error
                </h1>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Something went wrong while communicating with your cloud
                  workspace. Your local work remains preserved in this browser.
                </p>
                <pre className="mt-3 max-h-40 overflow-auto rounded border border-slate-200 bg-slate-50 p-2.5 font-mono text-[11px] text-slate-700 break-words whitespace-pre-wrap">
                  {this.state.message}
                </pre>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#0B162C] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reload Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
