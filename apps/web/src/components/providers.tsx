"use client";

import { Toaster } from "@/components/ui/sonner";

/**
 * Providers — workspace-scoped client providers.
 *
 * Theme lives in the root layout (`ThemeProvider` from next-themes). Toasts
 * are now Sonner: the single `<Toaster/>` here renders every notification,
 * and `toast()` is imported directly from `@/components/ui/sonner` (the legacy
 * `useToast()` adapter still routes to Sonner for call-sites not yet migrated).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
