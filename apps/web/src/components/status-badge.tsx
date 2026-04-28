type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "primary" | "success" | "warning" | "info" | "neutral";
  compact?: boolean;
};

const toneClasses: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-[color:var(--success-soft)] bg-[color:var(--success-soft)] text-[color:var(--success)]",
  warning: "border-[color:var(--warning-soft)] bg-[color:var(--warning-soft)] text-[color:var(--warning)]",
  info: "border-[color:var(--info-soft)] bg-[color:var(--info-soft)] text-[color:var(--info)]",
  neutral: "border-border bg-muted/30 text-muted-foreground",
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
