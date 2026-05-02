/**
 * Loading skeleton for /workspace/reports
 * Shown automatically during client-side navigation while page data loads.
 */
import { TableSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Page header skeleton */}
      <div className="flex items-start justify-between border-b border-border pb-3">
        <div className="space-y-2">
          <div className="skeleton-pulse h-3" />
          <div className="skeleton-pulse h-5" />
          <div className="skeleton-pulse h-3" />
        </div>
        <div className="skeleton-pulse h-8 w-28 rounded-full" />
      </div>

      {/* Audit results skeleton */}
      <section className="border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <div className="skeleton-pulse h-3" />
        </div>
        <TableSkeleton rows={8} cols={8} className="max-h-[440px]" />
      </section>

      {/* Coverage gaps skeleton */}
      <section className="border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <div className="skeleton-pulse h-3" />
        </div>
        <TableSkeleton rows={6} cols={4} />
      </section>
    </div>
  );
}
