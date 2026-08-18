"use client";

import { useCallback, useEffect } from "react";
import { useTheme as useNextTheme } from "next-themes";

import type { ThemeMode } from "@/lib/theme";

/**
 * useTheme — DiffAudit's theme hook, now backed by `next-themes`.
 *
 * This preserves the previous hand-rolled API (`theme`, `resolvedTheme`,
 * `setTheme`, `toggle`) so the five existing consumers (workspace-sidebar,
 * theme-toggle-button, theme-toggle, particle-field, settings) keep working
 * unchanged. The behavioural shift: `next-themes` ThemeProvider now owns the
 * `<html class="dark">` toggle (so shadcn `dark:` variants resolve) and the
 * no-flash boot script; this hook just reads it back.
 *
 * A small effect mirrors the legacy `data-theme` + `color-scheme` attributes
 * so any CSS keyed on `html[data-theme="dark"]` (not just `html.dark`) keeps
 * applying during the page-migration transition.
 */
export function useTheme() {
  const { theme, resolvedTheme, systemTheme, setTheme: setNextTheme } = useNextTheme();

  const currentTheme = (theme ?? "system") as ThemeMode;
  const resolved = (resolvedTheme ?? "light") as "light" | "dark";
  const system = (systemTheme ?? "light") as "light" | "dark";

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
  }, [resolved]);

  const setTheme = useCallback(
    (nextTheme: ThemeMode) => {
      setNextTheme(nextTheme);
    },
    [setNextTheme],
  );

  const toggle = useCallback(() => {
    setNextTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setNextTheme]);

  return { theme: currentTheme, resolvedTheme: resolved, systemTheme: system, setTheme, toggle };
}
