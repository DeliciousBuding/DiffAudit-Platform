"use client";

import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { useTheme } from "@/hooks/use-theme";
import type { ThemeMode } from "@/lib/theme";

type ThemeToggleLabels = {
  light: string;
  dark: string;
  system: string;
  active: string;
  prefix: string;
};

const DEFAULT_LABELS: ThemeToggleLabels = {
  light: "Light",
  dark: "Dark",
  system: "System",
  active: "Active",
  prefix: "Theme",
};

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.8v2.4" />
      <path d="M12 18.8v2.4" />
      <path d="m5.5 5.5 1.7 1.7" />
      <path d="m16.8 16.8 1.7 1.7" />
      <path d="M2.8 12h2.4" />
      <path d="M18.8 12h2.4" />
      <path d="m5.5 18.5 1.7-1.7" />
      <path d="m16.8 7.2 1.7-1.7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]">
      <path d="M18.4 14.4A7.2 7.2 0 0 1 9.6 5.6a7.8 7.8 0 1 0 8.8 8.8Z" />
    </svg>
  );
}

export function ThemeToggleButton({ labels }: { labels?: Partial<ThemeToggleLabels> } = {}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mergedLabels = { ...DEFAULT_LABELS, ...labels };
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const options: Array<{ value: ThemeMode; label: string; icon: ReactNode }> = [
    { value: "light", label: mergedLabels.light, icon: <SunIcon /> },
    { value: "dark", label: mergedLabels.dark, icon: <MoonIcon /> },
    {
      value: "system",
      label: mergedLabels.system,
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]">
          <rect x="3.5" y="4.5" width="17" height="12" rx="2" />
          <path d="M8 19.5h8" />
          <path d="M12 16.5v3" />
        </svg>
      ),
    },
  ];

  const fallbackOption = options.find((option) => option.value === "system") ?? options[0];
  const activeOption = mounted
    ? options.find((option) => option.value === theme) ?? options[0]
    : fallbackOption;
  const previewIcon = !mounted
    ? fallbackOption.icon
    : theme === "system"
    ? (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]">
        <rect x="3.5" y="4.5" width="17" height="12" rx="2" />
        <path d="M8 19.5h8" />
        <path d="M12 16.5v3" />
        {resolvedTheme === "dark" ? <path d="M16 8.5a3 3 0 1 1-4-2.82 3.8 3.8 0 1 0 4 2.82Z" /> : <circle cx="12" cy="10.5" r="2.6" />}
      </svg>
    )
    : resolvedTheme === "dark" ? <MoonIcon /> : <SunIcon />;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="header-pill header-pill-icon text-muted-foreground hover:text-foreground"
        aria-label={`${mergedLabels.prefix}: ${activeOption.label}`}
        aria-expanded={open}
        aria-haspopup="true"
        title={`${mergedLabels.prefix}: ${activeOption.label}`}
      >
        {previewIcon}
      </button>

      {open && (
        <div className="header-floating-panel absolute right-0 top-full z-50 mt-2 min-w-[172px] rounded-2xl p-1.5">
          {options.map((option) => {
            const selected = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "bg-[color:var(--accent-blue)]/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="shrink-0">{option.icon}</span>
                  <span>{option.label}</span>
                </span>
                {selected ? <span className="text-xs font-semibold text-[color:var(--accent-blue)]">{mergedLabels.active}</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
