import { KpiRowSkeleton } from "@/components/skeleton";
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted/30" />
      <KpiRowSkeleton />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/30" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-muted/30" />
    </div>
  );
}
