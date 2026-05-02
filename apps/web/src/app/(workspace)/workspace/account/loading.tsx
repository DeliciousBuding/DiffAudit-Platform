export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 skeleton-pulse rounded-lg" />
      <div className="h-20 skeleton-pulse rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 skeleton-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
