/**
 * Loading skeleton for /workspace
 * Shown automatically during client-side navigation while page data loads.
 */
import { KpiRowSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Page header skeleton */}
      <div className="border-b border-border pb-3 space-y-2">
        <div className="skeleton-pulse h-3" />
        <div className="skeleton-pulse h-5" />
        <div className="skeleton-pulse h-3" />
      </div>

      {/* KPI row skeleton */}
      <KpiRowSkeleton />

      {/* Main content skeleton */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <div className="skeleton-pulse h-3" />
          </div>
          <div className="p-3 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="skeleton-pulse h-3" />
                <div className="skeleton-pulse h-3" />
                <div className="skeleton-pulse h-3 ml-auto" />
              </div>
            ))}
          </div>
        </div>
        <div className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <div className="skeleton-pulse h-3" />
          </div>
          <div className="p-3 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="skeleton-pulse h-4 w-4 rounded-sm shrink-0" />
                <div className="skeleton-pulse h-3 flex-1 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
