type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "primary" | "success" | "warning" | "info" | "neutral";
  compact?: boolean;
};

const toneClasses: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  primary: "border-primary/30 bg-primary/20 text-primary",
  success: "border-[color:var(--success)]/25 bg-[color:var(--success-soft-strong)] text-[color:var(--success)]",
  warning: "border-[color:var(--warning)]/25 bg-[color:var(--warning-soft-strong)] text-[color:var(--warning)]",
  info: "border-[color:var(--info)]/25 bg-[color:var(--info-soft-strong)] text-[color:var(--info)]",
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
