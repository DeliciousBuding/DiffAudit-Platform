import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Textarea — multi-line peer of `Input`, same token/radius/focus grammar.
 * (Plain element — Base UI has no textarea primitive; the consistency comes
 * from sharing `border-input`/`focus-visible:ring-ring/50` with Input.)
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground shadow-sm transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/30",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
