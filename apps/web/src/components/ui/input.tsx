import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

/**
 * Input — the single text-field primitive. Base UI's `Input` adds proper
 * control semantics; styling here is one height (h-8), one radius
 * (rounded-md), one border token, and one focus ring — so no field across
 * the workspace drifts to a different shape. `aria-invalid` flips the ring to
 * the destructive token automatically.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-8 w-full min-w-0 rounded-md border border-input bg-background px-3 text-xs text-foreground shadow-sm transition-[color,box-shadow] outline-none placeholder:text-muted-foreground file:inline-flex file:border-0 file:bg-transparent file:text-foreground file:text-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/30",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
