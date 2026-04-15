/**
 * Loading skeleton for /workspace/audits/[jobId]
 * Shown automatically during client-side navigation while page data loads.
 */
import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Page header skeleton */}
      <div className="border-b border-border pb-3 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-80" />
      </div>

      {/* Job metadata card skeleton */}
      <section className="border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Log output skeleton */}
      <section className="border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="p-3 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={`h-3 ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-full' : 'w-5/6'}`} />
          ))}
        </div>
      </section>

      {/* Action buttons skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}
