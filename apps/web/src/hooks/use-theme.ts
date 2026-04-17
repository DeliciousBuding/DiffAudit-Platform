"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import {
  DEFAULT_THEME,
  resolveThemeMode,
  THEME_STORAGE_KEY,
  ThemeMode,
} from "@/lib/theme";

const SHARED_THEME_STORAGE_KEYS = [THEME_STORAGE_KEY, "platform-theme-v1"] as const;

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  for (const key of SHARED_THEME_STORAGE_KEYS) {
    const stored = window.localStorage.getItem(key);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  }

  return DEFAULT_THEME;
}

function subscribeToSystemTheme(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => onStoreChange();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }

  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    () => "light",
  );
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (
        event.key
        && !SHARED_THEME_STORAGE_KEYS.includes(event.key as (typeof SHARED_THEME_STORAGE_KEYS)[number])
      ) {
        return;
      }

      const nextTheme = getInitialTheme();
      setThemeState((currentTheme) => (currentTheme === nextTheme ? currentTheme : nextTheme));
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.dataset.themeMode = theme;
    root.style.colorScheme = resolvedTheme;
    root.classList.toggle("dark", resolvedTheme === "dark");
    for (const key of SHARED_THEME_STORAGE_KEYS) {
      window.localStorage.setItem(key, theme);
    }
  }, [theme, resolvedTheme]);

  const toggle = useCallback(() => {
    const currentResolvedTheme = theme === "system" ? systemTheme : theme;
    const nextTheme: ThemeMode = resolveThemeMode(currentResolvedTheme === "dark" ? "light" : "dark");
    setThemeState(nextTheme);
  }, [systemTheme, theme]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
  }, []);

  return { theme, resolvedTheme, setTheme, toggle };
}
