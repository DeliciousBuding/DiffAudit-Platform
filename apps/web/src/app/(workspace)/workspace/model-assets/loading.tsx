export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted/30" />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/30" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-64 animate-pulse rounded-2xl bg-muted/30" />
          <div className="h-48 animate-pulse rounded-2xl bg-muted/30" />
        </div>
      </div>
    </div>
  );
}
