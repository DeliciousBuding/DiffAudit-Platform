type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
type BadgeSize = "sm" | "md";

type BadgeProps = {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
};

const variantDotColors: Record<BadgeVariant, string> = {
  default: "bg-muted-foreground",
  success: "bg-[color:var(--success)]",
  warning: "bg-[color:var(--warning)]",
  error: "bg-[color:var(--risk-high)]",
  info: "bg-[color:var(--info)]",
};

const variantBadgeClasses: Record<BadgeVariant, string> = {
  default: "border-border bg-muted/30 text-muted-foreground",
  success: "border-[color:var(--success-soft)] bg-[color:var(--success-soft)] text-[color:var(--success)]",
  warning: "border-[color:var(--warning-soft)] bg-[color:var(--warning-soft)] text-[color:var(--warning)]",
  error: "border-[color:var(--risk-high-bg)] bg-[color:var(--risk-high-bg)] text-[var(--risk-high)]",
  info: "border-[color:var(--info-soft)] bg-[color:var(--info-soft)] text-[var(--info)]",
};

/**
 * Unified badge component.
 *
 * - `size="sm"`: compact dot only (no text wrapper)
 * - `size="md"`: full badge pill with dot + children text
 *
 * This is a new unified alternative — existing risk-badge.tsx and
 * status-badge.tsx are intentionally left untouched.
 */
export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  if (size === "sm") {
    return (
      <span
        className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${variantDotColors[variant]} ${className ?? ""}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border text-[11px] font-semibold leading-none px-2.5 py-0.5 whitespace-nowrap ${variantBadgeClasses[variant]} ${className ?? ""}`}
    >
      <span
        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${variantDotColors[variant]}`}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
