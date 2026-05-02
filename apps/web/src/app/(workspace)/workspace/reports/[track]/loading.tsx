export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-muted/30" />
      <div className="h-10 w-48 animate-pulse rounded-full bg-muted/30" />
      <div className="h-64 animate-pulse rounded-2xl bg-muted/30" />
      <div className="h-48 animate-pulse rounded-2xl bg-muted/30" />
    </div>
  );
}
