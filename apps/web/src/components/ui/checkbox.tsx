"use client";

import { Check as CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import { cn } from "@/lib/utils";

/**
 * Checkbox — Base UI-backed (replaces the hand-rolled `audit-filters` status
 * pills' bespoke toggle, and the native checkbox). Base UI owns the tri-state
 * `checked`/`indeterminate` semantics, `aria-checked`, keyboard toggle, and
 * focus ring; this file styles the box + indicator.
 */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative size-4 shrink-0 rounded-[4px] border border-input bg-background text-primary-foreground shadow-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-primary data-[checked]:border-primary data-[indeterminate]:bg-primary data-[indeterminate]:border-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon strokeWidth={2.5} className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
