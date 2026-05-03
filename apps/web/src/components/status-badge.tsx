type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  compact?: boolean;
};

const toneClasses: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  primary: "border-primary/30 bg-primary/20 text-primary",
  success: "border-[var(--success)]/25 bg-[var(--success-soft-strong)] text-[var(--success)]",
  warning: "border-[var(--warning)]/25 bg-[var(--warning-soft-strong)] text-[var(--warning)]",
  danger: "border-[var(--risk-high)]/25 bg-[var(--risk-high)]/10 text-[var(--risk-high)]",
  info: "border-[var(--info)]/25 bg-[var(--info-soft-strong)] text-[var(--info)]",
  neutral: "border-border bg-muted/50 text-muted-foreground",
};

export function StatusBadge({
  children,
  tone = "primary",
  compact = false,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border text-[11px] font-semibold ${compact ? "px-1.5 py-0.5" : "px-3 py-1.5 gap-2"} ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
