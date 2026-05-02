import { KpiRowSkeleton, TableSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted/30" />
      <KpiRowSkeleton />
      <div className="h-12 animate-pulse rounded-2xl bg-muted/30" />
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}
