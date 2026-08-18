import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Label — accessible form label (plain `<label>`, `htmlFor` association).
 * Used standalone and composed inside `Field`/`FieldLabel`. Plain element by
 * design (Base UI has no dedicated label primitive); the a11y contract comes
 * from native `htmlFor` ↔ control `id` pairing.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-xs font-medium leading-none text-foreground select-none group-data-[disabled=true]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
