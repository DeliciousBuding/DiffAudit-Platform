"use client";

import { Component, type ReactNode } from "react";
import { type Locale } from "@/components/language-picker";
import { ErrorFallbackUI } from "@/components/error-fallback-ui";

interface ErrorBoundaryProps {
  children: ReactNode;
  locale?: Locale;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      const isRuntimeError =
        this.state.error.message.toLowerCase().includes("runtime") ||
        this.state.error.message.toLowerCase().includes("fetch") ||
        this.state.error.message.toLowerCase().includes("network");

      return (
        <ErrorFallbackUI
          locale={this.props.locale ?? "en-US"}
          error={this.state.error}
          reset={this.reset}
          isRuntimeError={isRuntimeError}
        />
      );
    }

    return this.props.children;
  }
}
