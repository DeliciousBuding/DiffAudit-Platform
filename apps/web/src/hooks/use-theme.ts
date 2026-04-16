"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_THEME,
  resolveThemeMode,
  THEME_STORAGE_KEY,
  ThemeMode,
} from "@/lib/theme";

const SHARED_THEME_STORAGE_KEYS = [THEME_STORAGE_KEY, "platform-theme-v1"] as const;

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  for (const key of SHARED_THEME_STORAGE_KEYS) {
    const stored = window.localStorage.getItem(key);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    root.classList.toggle("dark", theme === "dark");
    for (const key of SHARED_THEME_STORAGE_KEYS) {
      window.localStorage.setItem(key, theme);
    }
  }, [theme]);

  const toggle = useCallback((x?: number, y?: number) => {
    const root = document.documentElement;
    const nextTheme: ThemeMode = resolveThemeMode(root.classList.contains("dark") ? "light" : "dark");

    const originX = x ?? 40;
    const originY = y ?? window.innerHeight - 40;
    const endRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY),
    );

    if ("startViewTransition" in document && typeof document.startViewTransition === "function") {
      const transition = document.startViewTransition(() => {
        setThemeState(nextTheme);
      });

      transition.ready.then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${originX}px ${originY}px)`,
              `circle(${endRadius}px at ${originX}px ${originY}px)`,
            ],
          },
          {
            duration: 500,
            easing: "ease-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });
      return;
    }

    setThemeState(nextTheme);
  }, []);

  return { theme, toggle };
}
