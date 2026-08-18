import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "@/lib/utils";

/**
 * Separator — accessible divider between content groups.
 *
 * Base UI renders a real `<div role="separator">` with the correct
 * `aria-orientation` (derived from the `orientation` prop), so screen readers
 * announce the boundary. Replaces the ad-hoc `<div className="h-px bg-border">`
 * dividers scattered through the legacy tables.
 */
function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive>) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
