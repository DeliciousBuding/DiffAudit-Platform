"use client";

import { useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import type { ThemeMode } from "@/lib/theme";

/** Global theme toggle button — cycles light → dark → system */
export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const cycleTheme = useCallback(() => {
    const order: ThemeMode[] = ["light", "dark", "system"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  }, [theme, setTheme]);

  const label = theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-all duration-200 hover:border-[color:var(--accent-blue)]/40 hover:text-foreground hover:bg-[color:var(--accent-blue)]/5 active:scale-95"
      title={`Theme: ${label} (click to cycle)`}
      aria-label={`Theme: ${label}, click to change`}
    >
      {theme === "system" ? (
        /* System icon — half sun half moon */
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M13 3v18" />
          <path d="M13 7h4" />
          <path d="M13 11h5" />
          <path d="M13 15h4" />
          <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="9" cy="15" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      ) : resolvedTheme === "dark" ? (
        /* Moon icon */
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      ) : (
        /* Sun icon */
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}
