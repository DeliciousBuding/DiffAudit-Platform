"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

import { cn } from "@/lib/utils";

/**
 * Toaster — the single notification surface (replaces the hand-rolled
 * `components/toast.tsx` + `toast-provider.tsx`, which were a bespoke
 * bottom-right stack with inline-SVG icons and per-type reimplemented styles).
 *
 * Uses Sonner for the hard parts (queueing, auto-dismiss, swipe-to-dismiss,
 * stacking, portal, reduced-motion). Theme syncs through next-themes
 * (`useTheme`) once the app's provider migrates (see roadmap). Colours resolve
 * through DiffAudit semantic tokens, so success / warning / destructive
 * toasts share one visual language with Badge and Button.
 *
 * `toast` is re-exported as the only sanctioned way to emit a notification.
 */
function Toaster({ className, ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      className={cn("toaster group", className)}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-border group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:shadow-md group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:border-success/30 group-[.toast]:text-success",
          error: "group-[.toast]:border-destructive/30 group-[.toast]:text-destructive",
          warning: "group-[.toast]:border-warning/30 group-[.toast]:text-warning",
          info: "group-[.toast]:border-info/30 group-[.toast]:text-info",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
export { toast } from "sonner";
