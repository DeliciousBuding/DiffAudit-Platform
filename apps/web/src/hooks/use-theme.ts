"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  ThemeMode,
} from "@/lib/theme";

function resolveToLightOrDark(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return DEFAULT_THEME;
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const resolved = resolveToLightOrDark(theme);
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
    root.classList.toggle("dark", resolved === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      const resolved = e.matches ? "dark" : "light";
      root.dataset.theme = resolved;
      root.style.colorScheme = resolved;
      root.classList.toggle("dark", resolved === "dark");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const toggle = useCallback((x?: number, y?: number) => {
    const root = document.documentElement;
    const nextTheme: ThemeMode = root.classList.contains("dark") ? "light" : "dark";

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

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const resolvedTheme = typeof window !== "undefined" ? resolveToLightOrDark(theme) : "light";

  return { theme, resolvedTheme, toggle, setTheme };
}
