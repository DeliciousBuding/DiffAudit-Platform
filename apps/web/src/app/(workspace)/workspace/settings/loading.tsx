export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 skeleton-pulse rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 skeleton-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
