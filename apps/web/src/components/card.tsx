import { forwardRef, type HTMLAttributes } from "react";

export type CardVariant = "default" | "elevated" | "bordered" | "ghost";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "rounded-lg border border-border bg-card",
  elevated: "rounded-lg border border-border bg-card shadow-sm",
  bordered: "rounded-lg border-2 border-border bg-card",
  ghost: "rounded-lg bg-transparent",
};

/**
 * Unified card component for DiffAudit.
 *
 * Variants:
 *   default  — standard bordered card (sections, panels)
 *   elevated — with rounded corners + subtle shadow (KPIs, callouts)
 *   bordered — heavier border emphasis (highlighted sections)
 *   ghost    — no chrome (when parent provides the border)
 *
 * Anatomy (as documented in DESIGN.md §11.1):
 *   Card shell: border border-border bg-card
 *     Section header: border-b border-border bg-muted/20 px-3 py-2
 *     Section body: p-3
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

/** Card header — use inside Card for section headers */
export function CardHeader({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`border-b border-border bg-muted/20 px-3 py-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/** Card body — use inside Card for section content */
export function CardBody({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-3 ${className}`} {...props}>
      {children}
    </div>
  );
}
