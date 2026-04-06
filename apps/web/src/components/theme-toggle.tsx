"use client";

import { useState } from "react";

import {
  DEFAULT_THEME,
  resolveThemeMode,
  THEME_STORAGE_KEY,
  ThemeMode,
} from "@/lib/theme";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.classList.toggle("dark", theme === "dark");
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [nonce, setNonce] = useState(0);
  const theme =
    typeof document === "undefined"
      ? DEFAULT_THEME
      : resolveThemeMode(document.documentElement.dataset.theme);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setNonce((value) => value + 1);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-theme-nonce={nonce}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/55 text-muted-foreground transition hover:-translate-y-px hover:text-foreground dark:bg-white/5"
      aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
      title={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
    >
      <span className="mono text-[11px] font-semibold uppercase">
        {theme === "dark" ? "LT" : "DK"}
      </span>
    </button>
  );
}
