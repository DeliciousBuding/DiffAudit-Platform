"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  DEFAULT_THEME,
  resolveThemeMode,
  THEME_STORAGE_KEY,
  ThemeMode,
} from "@/lib/theme";

const SHARED_THEME_STORAGE_KEYS = [THEME_STORAGE_KEY, "platform-theme-v1"] as const;
const THEME_CHANGE_EVENT = "diffaudit-theme-change";

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

function subscribeToStoredTheme(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleStorage(event: StorageEvent) {
    if (
      event.key
      && !SHARED_THEME_STORAGE_KEYS.includes(event.key as (typeof SHARED_THEME_STORAGE_KEYS)[number])
    ) {
      return;
    }

    onStoreChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function getServerThemeSnapshot(): ThemeMode {
  return DEFAULT_THEME;
}

function writeTheme(nextTheme: ThemeMode) {
  for (const key of SHARED_THEME_STORAGE_KEYS) {
    window.localStorage.setItem(key, nextTheme);
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToStoredTheme,
    getInitialTheme,
    getServerThemeSnapshot,
  );
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    () => "light",
  );
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.dataset.themeMode = theme;
    root.style.colorScheme = resolvedTheme;
    root.classList.toggle("dark", resolvedTheme === "dark");
  }, [theme, resolvedTheme]);

  const toggle = useCallback(() => {
    const currentResolvedTheme = theme === "system" ? systemTheme : theme;
    const nextTheme: ThemeMode = resolveThemeMode(currentResolvedTheme === "dark" ? "light" : "dark");
    writeTheme(nextTheme);
  }, [systemTheme, theme]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    writeTheme(nextTheme);
  }, []);

  return { theme, resolvedTheme, setTheme, toggle };
}
