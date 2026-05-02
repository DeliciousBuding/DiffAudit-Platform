import { KpiRowSkeleton } from "@/components/skeleton";
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 skeleton-pulse rounded-lg" />
      <KpiRowSkeleton />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 skeleton-pulse rounded-2xl" />
        ))}
      </div>
      <div className="h-48 skeleton-pulse rounded-2xl" />
    </div>
  );
}
