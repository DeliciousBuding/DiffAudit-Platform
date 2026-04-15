/**
 * Loading skeleton for /workspace/audits/new
 * Shown automatically during client-side navigation while page data loads.
 */
import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Page header skeleton */}
      <div className="border-b border-border pb-3 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-3 w-96" />
      </div>

      {/* Step indicator skeleton */}
      <div className="flex items-center justify-between gap-2 px-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Form content skeleton */}
      <section className="border border-border bg-card p-4">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action buttons skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
