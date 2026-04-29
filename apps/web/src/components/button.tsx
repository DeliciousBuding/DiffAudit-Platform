import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "default" | "primary" | "destructive" | "ghost" | "pill" | "pill-sm" | "text";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:border-[rgba(47,109,246,0.52)] focus-visible:ring-2 focus-visible:ring-[rgba(47,109,246,0.08)] disabled:opacity-50 disabled:cursor-not-allowed",
  primary:
    "inline-flex items-center justify-center rounded-md border border-[var(--accent-blue)] bg-[var(--accent-blue)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-blue-hover)] focus-visible:ring-2 focus-visible:ring-[rgba(47,109,246,0.24)] disabled:opacity-50 disabled:cursor-not-allowed",
  destructive:
    "inline-flex items-center justify-center rounded-md border border-[var(--accent-coral)] bg-[var(--accent-coral)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[rgba(255,95,70,0.24)] disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "inline-flex items-center justify-center rounded-md border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:border-[rgba(47,109,246,0.52)] focus-visible:ring-2 focus-visible:ring-[rgba(47,109,246,0.08)] disabled:opacity-50 disabled:cursor-not-allowed",
  pill:
    "inline-flex items-center justify-center rounded-full border border-transparent bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-all hover:-translate-y-px hover:bg-[var(--palette-grey-900)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed",
  "pill-sm":
    "inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2 text-xs font-medium transition-all hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed",
  text:
    "inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed",
};

const sizeOverrides: Record<ButtonSize, string> = {
  sm: "px-2 py-1 text-[11px]",
  md: "px-3 py-1.5 text-xs",
  lg: "px-4 py-2 text-sm",
};

/**
 * Unified button component for DiffAudit.
 *
 * Variants:
 *   default    — neutral bordered button (settings, filters)
 *   primary    — blue filled button (main page actions)
 *   destructive — coral filled button (cancel, delete)
 *   ghost      — transparent with border (secondary actions)
 *   pill       — large pill (auth forms, marketing CTAs)
 *   pill-sm    — small pill (export, compact CTAs)
 *   text       — lightweight inline action
 *
 * Sizes (only affect default/primary/destructive/ghost):
 *   sm — compact
 *   md — standard (default)
 *   lg — emphasized
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", children, ...props }, ref) => {
    const baseClass = variantStyles[variant];
    const sizeClass = variant === "pill" || variant === "pill-sm" || variant === "text" ? "" : sizeOverrides[size];

    return (
      <button
        ref={ref}
        className={`ui-button ${baseClass} ${sizeClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
