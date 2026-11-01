import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('VJEditor Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-app text-fg grid place-items-center p-6 select-none">
          <div className="max-w-md w-full rounded-2xl border border-border bg-app-elevated p-6 text-center space-y-4 shadow-2xl">
            <div className="h-14 w-14 rounded-2xl bg-danger/15 text-danger grid place-items-center mx-auto">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-fg">Editor Session Restored</h1>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                An unexpected issue occurred while loading this view. Your project data remains safe in local storage.
              </p>
              {this.state.error?.message ? (
                <p className="mt-3 p-2 rounded-lg bg-panel border border-border text-[11px] font-mono text-danger/90 truncate">
                  {this.state.error.message}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = '#/dashboard';
                  window.location.reload();
                }}
                className="flex-1 h-10 rounded-xl bg-accent text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:bg-accent/90 transition"
              >
                <RefreshCw size={14} />
                Open Workspace Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
