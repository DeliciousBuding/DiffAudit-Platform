import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Badge — one component for every status / risk / tone pill in DiffAudit.
 *
 * Collapses four legacy files into one:
 *   - components/badge.tsx            (default/success/warning/error/info)
 *   - components/risk-badge.tsx       (AUC → high/medium/low)
 *   - components/status-badge.tsx     (primary/success/warning/danger/info/neutral)
 *   - components/runtime-status-badge.tsx (connected/demo/disconnected)
 *
 * Variant taxonomy (the only sanctioned set — adding a new tone means adding
 * a variant here, not a new component):
 *   default     brand-blue pill        (was: status-badge `primary`)
 *   secondary   neutral grey pill      (was: status-badge `neutral`)
 *   destructive coral pill             (was: status-badge `danger`, badge `error`)
 *   outline     bordered pill
 *   success     green pill             (was: badge `success`, risk-low)
 *   warning     amber pill             (was: badge `warning`, risk-medium)
 *   info        blue pill              (was: badge `info`)
 *   high        coral risk pill        (was: risk-badge `high`)
 *   medium      amber risk pill        (was: risk-badge `medium`)
 *   low         green risk pill        (was: risk-badge `low`)
 *
 * The runtime-status badge becomes a thin wrapper that maps its connection
 * state to one of these variants — no separate visual language.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-[11px] font-medium leading-[1.4] whitespace-nowrap transition-colors [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary/12 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/12 text-destructive",
        outline: "border-input text-foreground bg-transparent",
        success: "bg-success/12 text-success",
        warning: "bg-warning/12 text-warning",
        info: "bg-info/12 text-info",
        high: "bg-risk-high/14 text-risk-high",
        medium: "bg-risk-medium/14 text-risk-medium",
        low: "bg-risk-low/14 text-risk-low",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
