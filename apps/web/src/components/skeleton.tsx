/**
 * Skeleton loaders for data loading states.
 * All components are client components so they can be used inside Suspense fallbacks.
 */

"use client";

/** Base shimmer block — premium skeleton with smooth left-to-right shimmer */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`skeleton-pulse rounded-md ${className ?? ""}`}
      style={style}
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
    <div className={`rounded-lg border border-border bg-card p-4 ${className ?? ""}`}>
      {/* label */}
      <Skeleton className="h-2.5 w-24" />
      {/* value */}
      <Skeleton className="mt-2 h-8 w-16" />
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

/** Sidebar / tasks panel skeleton */
export function SidebarSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="p-3 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-2">
          <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
          <Skeleton className="h-3 flex-1 rounded" />
        </div>
      ))}
    </div>
  );
}

/** Chart section skeleton: header bar + chart area */
export function ChartSkeleton({ height = 220 }: { height?: number }) {
  const widths = [65, 80, 55, 90, 70];
  return (
    <div className="p-3">
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="space-y-3 w-full px-4">
          {widths.map((width, i) => (
            <div key={i} style={{ width: `${width}%` }}>
              <Skeleton className="h-3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Coverage bar skeleton */
export function CoverageBarSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Audit track card skeleton */
export function AuditTrackCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-20" />
        <div className="ml-auto"><Skeleton className="h-4 w-12 rounded-full" /></div>
      </div>
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}
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
