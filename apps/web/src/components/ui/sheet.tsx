"use client";

import * as React from "react";
import { X as XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Sheet — side-anchored panel (a Base UI Dialog variant). The mobile sidebar
 * and any drawer-style surface compose from it. `side` controls the anchor and
 * the enter/exit translate axis.
 */
function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Backdrop>) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity duration-200",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Popup> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
}) {
  const sideClass =
    side === "top"
      ? "inset-x-0 top-0 border-b data-[starting-style]:translate-y-[-2.5rem] data-[ending-style]:translate-y-[-2.5rem]"
      : side === "bottom"
        ? "inset-x-0 bottom-0 border-t data-[starting-style]:translate-y-[2.5rem] data-[ending-style]:translate-y-[2.5rem]"
        : side === "left"
          ? "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r data-[starting-style]:translate-x-[-2.5rem] data-[ending-style]:translate-x-[-2.5rem]"
          : "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l data-[starting-style]:translate-x-[2.5rem] data-[ending-style]:translate-x-[2.5rem]";

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 grid gap-4 bg-background p-6 shadow-lg outline-none transition-[transform,opacity] duration-200 ease-in-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
          sideClass,
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Close sheet" className="absolute right-3 top-3" />
            }
          >
            <XIcon strokeWidth={1.5} />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-1.5", className)} {...props} />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-sm font-semibold leading-none", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-xs leading-5", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
