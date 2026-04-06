"use client";

import { useState } from "react";

import {
  DEFAULT_THEME,
  getEffectiveTheme,
  getThemeLabel,
  resolveThemeMode,
  THEME_STORAGE_KEY,
  ThemeMode,
} from "@/lib/theme";

const themeModes: ThemeMode[] = ["light", "dark", "system"];

function prefersDarkMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(themeMode: ThemeMode) {
  const root = document.documentElement;
  const effectiveTheme = getEffectiveTheme(themeMode, prefersDarkMode());
  root.dataset.themeMode = themeMode;
  root.dataset.theme = effectiveTheme;
  root.style.colorScheme = effectiveTheme;
  root.classList.toggle("dark", effectiveTheme === "dark");
  window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
}

function ThemeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === "light") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 1.8v2.4M12 19.8v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
      </svg>
    );
  }

  if (mode === "dark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
        <path d="M20.2 14.2A8.6 8.6 0 0 1 9.8 3.8a8.6 8.6 0 1 0 10.4 10.4Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <rect x="3.5" y="5" width="17" height="11" rx="2" />
      <path d="M8.5 19h7" />
      <path d="M12 16v3" />
    </svg>
  );
}

export function ThemeToggle() {
  const [nonce, setNonce] = useState(0);
  const themeMode =
    typeof document === "undefined"
      ? DEFAULT_THEME
      : resolveThemeMode(document.documentElement.dataset.themeMode);

  return (
    <div
      data-theme-nonce={nonce}
      className="inline-flex items-center gap-1 rounded-2xl border border-border bg-white/55 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:bg-white/5"
    >
      {themeModes.map((mode) => {
        const active = themeMode === mode;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => {
              applyTheme(mode);
              setNonce((value) => value + 1);
            }}
            className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition ${
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-white/70 hover:text-foreground dark:hover:bg-white/10"
            }`}
            aria-label={getThemeLabel(mode)}
            title={getThemeLabel(mode)}
          >
            <ThemeIcon mode={mode} />
            <span className="hidden sm:inline">{getThemeLabel(mode)}</span>
          </button>
        );
      })}
    </div>
  );
}
