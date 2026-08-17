import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Skeleton — the only loading-shimmer primitive.
 *
 * Replaces the legacy `components/skeleton.tsx` file (which exported both a
 * bare `Skeleton` and bespoke `TableSkeleton` / `KpiSkeleton` / etc.). Those
 * composite loaders are compositions of this single primitive, not separate
 * components — build them inline at the call site with `Skeleton` blocks.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted/60 animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
