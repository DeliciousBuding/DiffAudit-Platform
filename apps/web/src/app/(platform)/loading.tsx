export default function PlatformLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-44 animate-pulse rounded-xl bg-muted/40" />
        <div className="h-4 w-[48ch] animate-pulse rounded-xl bg-muted/30" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[108px] animate-pulse rounded-[26px] border border-border bg-white/40 dark:bg-white/5"
          />
        ))}
      </div>

      <div className="h-[420px] animate-pulse rounded-[28px] border border-border bg-white/35 dark:bg-white/5" />
    </div>
  );
}

