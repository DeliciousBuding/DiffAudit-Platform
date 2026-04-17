"use client";

import { useCallback, useEffect, useState } from "react";

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

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    getInitialTheme() === "system" ? getSystemTheme() : (getInitialTheme() as "light" | "dark"),
  );

  useEffect(() => {
    if (theme === "system") {
      setResolvedTheme(getSystemTheme());
      return;
    }
    setResolvedTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setResolvedTheme(mediaQuery.matches ? "dark" : "light");
    update();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, [theme]);

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
    const root = document.documentElement;
    const nextTheme: ThemeMode = resolveThemeMode(root.classList.contains("dark") ? "light" : "dark");
    setThemeState(nextTheme);
  }, []);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
  }, []);

  return { theme, resolvedTheme, setTheme, toggle };
}
