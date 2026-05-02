export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 skeleton-pulse rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 skeleton-pulse rounded-2xl" />
        ))}
      </div>
      <div className="h-64 skeleton-pulse rounded-2xl" />
    </div>
  );
}
