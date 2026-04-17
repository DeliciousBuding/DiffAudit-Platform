/**
 * Skeleton loaders for data loading states.
 * All components are client components so they can be used inside Suspense fallbacks.
 */

"use client";

/** Base pulse block */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/30 ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

/** Table skeleton: rows × cols grid of pulse blocks */
export function TableSkeleton({
  rows = 5,
  cols = 6,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-auto ${className ?? ""}`}>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-3 py-1.5 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-border"
            >
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx} className="px-3 py-2">
                  <Skeleton
                    className={`h-3 ${
                      colIdx === cols - 1 ? "w-12 ml-auto" : colIdx === 0 ? "w-24" : "w-20"
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** KPI card skeleton: title bar + large number + description line */
export function KpiSkeleton({ className }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-3 ${className ?? ""}`}>
      {/* label */}
      <Skeleton className="h-2.5 w-24" />
      {/* value */}
      <Skeleton className="mt-2 h-7 w-16" />
      {/* note */}
      <Skeleton className="mt-2 h-2.5 w-32" />
    </div>
  );
}

/** KPI row skeleton: 4 cards for the dashboard */
export function KpiRowSkeleton({ className }: { className?: string }) {
  return (
    <div className={`grid gap-3 grid-cols-2 lg:grid-cols-4 ${className ?? ""}`}>
      <KpiSkeleton />
      <KpiSkeleton />
      <KpiSkeleton />
      <KpiSkeleton />
    </div>
  );
}

/** Compact skeleton for JobsList while it's loading (inside the running-jobs panel) */
export function JobsListSkeleton({ className }: { className?: string }) {
  return (
    <div className={`space-y-0 divide-y divide-border ${className ?? ""}`}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="px-3 py-2 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2.5 w-36" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
