type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "primary" | "success" | "warning" | "info";
};

const toneClasses: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-[color:var(--success-soft)] bg-[color:var(--success-soft)] text-[color:var(--success)]",
  warning: "border-[color:var(--warning-soft)] bg-[color:var(--warning-soft)] text-[color:var(--warning)]",
  info: "border-[color:var(--info-soft)] bg-[color:var(--info-soft)] text-[color:var(--info)]",
};

export function StatusBadge({
  children,
  tone = "primary",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
