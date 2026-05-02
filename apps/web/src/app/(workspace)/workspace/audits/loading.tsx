/**
 * Loading skeleton for /workspace/audits
 * Shown automatically during client-side navigation while page data loads.
 */
import { TableSkeleton, JobsListSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Page header skeleton */}
      <div className="border-b border-border pb-3 space-y-2">
        <div className="skeleton-pulse h-3" />
        <div className="skeleton-pulse h-5" />
        <div className="skeleton-pulse h-3" />
      </div>

      {/* Toolbar skeleton */}
      <div className="border border-border bg-card p-3">
        <div className="skeleton-pulse h-8 w-full rounded-md" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <section className="lg:col-span-2 border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <div className="skeleton-pulse h-3" />
          </div>
          <TableSkeleton rows={5} cols={5} className="max-h-[420px]" />
        </section>

        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <div className="skeleton-pulse h-3" />
          </div>
          <JobsListSkeleton />
        </section>
      </div>

      {/* Recent results skeleton */}
      <section className="border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <div className="skeleton-pulse h-3" />
        </div>
        <TableSkeleton rows={8} cols={6} className="max-h-[360px]" />
      </section>
    </div>
  );
}
