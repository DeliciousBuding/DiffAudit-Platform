import { KpiRowSkeleton, TableSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 skeleton-pulse rounded-lg" />
      <KpiRowSkeleton />
      <div className="h-12 skeleton-pulse rounded-2xl" />
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}
