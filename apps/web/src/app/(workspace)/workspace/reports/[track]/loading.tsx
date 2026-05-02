export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 skeleton-pulse rounded-lg" />
      <div className="h-10 w-48 skeleton-pulse rounded-full" />
      <div className="h-64 skeleton-pulse rounded-2xl" />
      <div className="h-48 skeleton-pulse rounded-2xl" />
    </div>
  );
}
