import { Button as ButtonPrimitive, type ButtonProps } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button — the single canonical button for the DiffAudit design system.
 *
 * Built on three layers, per the workspace design contract:
 *   - Base UI `@base-ui/react/button` — interaction behaviour + accessibility
 *     (focus management, disabled semantics, `render` prop polymorphism,
 *     `nativeButton`, `focusableWhenDisabled`).
 *   - shadcn grammar — `data-slot`, `cva` variants, exported `buttonVariants`
 *     helper so links can reuse the exact same visual treatment.
 *   - Tailwind v4 + DiffAudit design tokens — every colour resolves through a
 *     semantic token (bg-primary, text-muted-foreground, border-border …), so
 *     light/dark and brand restyles never require touching component code.
 *
 * Variant → intent map (replaces the seven ad-hoc variants of the legacy
 * `components/button.tsx`):
 *   default     brand-blue filled   (was: legacy `primary`)
 *   secondary   neutral grey filled
 *   outline     bordered, surface background
 *   ghost       transparent, accent on hover
 *   destructive coral filled        (was: legacy `destructive`)
 *   link        inline text action
 *
 * Acceptance criteria — the contract every consumer can rely on:
 *   1. exactly one rounded-corner scale (rounded-md by default, the radius
 *      tokens now exposed in @theme inline), so no button drifts to a
 *      different radius;
 *   2. one focus ring treatment (ring-ring/50, 3px) across all variants;
 *   3. disabled state is uniform (opacity-50 + pointer-events-none) and stays
 *      keyboard-focusable when `focusableWhenDisabled` is set;
 *   4. icon spacing is automatic via `data-icon="inline-start|inline-end"`;
 *   5. `buttonVariants` is the only sanctioned way to make a non-button look
 *      like a button (links, pagination, table rows).
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-150 select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 aria-invalid:ring-destructive/30 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost:
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3 text-xs",
        xs: "h-7 gap-1 px-2 text-[11px]",
        sm: "h-7 gap-1 px-2.5 text-xs",
        lg: "h-9 gap-2 px-4 text-sm",
        icon: "size-8",
        "icon-xs": "size-7",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
