"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";

import { cn } from "@/lib/utils";

/**
 * ToggleGroup — Base UI-backed segmented control. Replaces the hand-rolled
 * `table-density-toggle` (compact/default/comfortable) and the `audit-filters`
 * status pill group, both of which reimplemented `aria-pressed` roving by hand.
 *
 * Architecture: `ToggleGroup` (the Base UI controller root) manages shared
 * pressed state and `aria-pressed` wiring; each `ToggleGroupItem` is a Base UI
 * `Toggle` that opts into the group via its `value` prop. Base UI owns the
 * single/multiple selection model and keyboard navigation.
 */
function ToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive>) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5",
        className,
      )}
      {...props}
    />
  );
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof TogglePrimitive>) {
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex h-7 items-center justify-center gap-1 rounded-[5px] px-2.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-sm [&_svg]:size-3.5 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
