type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  iconLabel: string;
  tone?: "primary" | "success" | "warning" | "info";
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/12 text-primary",
  success: "bg-[color:var(--success-soft)] text-[color:var(--success)]",
  warning: "bg-[color:var(--warning-soft)] text-[color:var(--warning)]",
  info: "bg-[color:var(--info-soft)] text-[color:var(--info)]",
};

export function StatCard({
  label,
  value,
  sub,
  iconLabel,
  tone = "primary",
}: StatCardProps) {
  return (
    <article className="surface-card p-4 transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-3 text-[30px] font-semibold leading-none tracking-tight">{value}</div>
        </div>
        <div
          className={`mono inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[11px] font-semibold ${toneClasses[tone]}`}
        >
          {iconLabel}
        </div>
      </div>
      {sub ? (
        <div className="mt-4 border-t border-border pt-3 text-xs leading-6 text-muted-foreground">
          {sub}
        </div>
      ) : null}
    </article>
  );
}
