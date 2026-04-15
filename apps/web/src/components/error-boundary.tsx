"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary for catching React errors.
 * Wraps the workspace layout to handle Runtime unavailability and other errors gracefully.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const isRuntimeError = error.message.toLowerCase().includes("runtime") ||
                         error.message.toLowerCase().includes("fetch") ||
                         error.message.toLowerCase().includes("network");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full border-2 border-[color:var(--warning)]/40 bg-[color:var(--warning)]/5 rounded-lg p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--warning)]/20">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[color:var(--warning)]" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2 text-foreground">
              {isRuntimeError ? "Runtime Service Unavailable" : "Something went wrong"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {isRuntimeError
                ? "Unable to connect to the DiffAudit Runtime service. Please ensure the Runtime server is running and accessible."
                : "An unexpected error occurred while rendering this page."}
            </p>

            <details className="mb-4">
              <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                Error details
              </summary>
              <pre className="mt-2 p-3 bg-muted/30 rounded-md text-xs overflow-auto max-h-32 border border-border">
                {error.message}
              </pre>
            </details>

            <div className="flex items-center gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-md border border-[color:var(--accent-blue)] bg-[color:var(--accent-blue)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:opacity-90"
              >
                Try again
              </button>
              <a
                href="/workspace"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
              >
                Go to workspace
              </a>
            </div>

            {isRuntimeError && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Quick fixes:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Check Runtime server is running on the configured host/port</li>
                  <li>Verify network connectivity to the Runtime service</li>
                  <li>Enable Demo Mode in Settings to use snapshot data</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
