"use client";

import { TableSkeleton, KpiRowSkeleton, ChartSkeleton } from "./skeleton";

interface LoadingStateProps {
  message?: string;
  type?: "table" | "kpi" | "chart" | "default";
  className?: string;
}

/**
 * Enhanced loading state with user-friendly message
 * Shows what the system is currently doing
 */
export function LoadingState({ message, type = "default", className }: LoadingStateProps) {
  const defaultMessages = {
    table: "Loading audit results...",
    kpi: "Calculating metrics...",
    chart: "Generating visualization...",
    default: "Loading...",
  };

  const displayMessage = message || defaultMessages[type];

  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
        </svg>
        <span>{displayMessage}</span>
      </div>
      {type === "table" && <TableSkeleton rows={3} />}
      {type === "kpi" && <KpiRowSkeleton />}
      {type === "chart" && <ChartSkeleton />}
      {type === "default" && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[color:var(--accent-blue)] border-t-transparent" />
        </div>
      )}
    </div>
  );
}

/**
 * Inline loading spinner with optional message
 */
export function InlineLoader({ message, size = "sm" }: { message?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-[color:var(--accent-blue)] border-t-transparent`}
        aria-hidden="true"
      />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}
