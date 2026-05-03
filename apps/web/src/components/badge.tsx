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
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  error: "bg-[var(--risk-high)]",
  info: "bg-[var(--info)]",
};

const variantBadgeClasses: Record<BadgeVariant, string> = {
  default: "border-border bg-muted/30 text-muted-foreground",
  success: "border-[var(--success-soft)] bg-[var(--success-soft)] text-[var(--success)]",
  warning: "border-[var(--warning-soft)] bg-[var(--warning-soft)] text-[var(--warning)]",
  error: "border-[var(--risk-high-bg)] bg-[var(--risk-high-bg)] text-[var(--risk-high)]",
  info: "border-[var(--info-soft)] bg-[var(--info-soft)] text-[var(--info)]",
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
