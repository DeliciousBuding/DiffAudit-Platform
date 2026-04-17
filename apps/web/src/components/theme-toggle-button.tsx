"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { useTheme } from "@/hooks/use-theme";
import type { ThemeMode } from "@/lib/theme";

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

export function ThemeToggleButton() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    { value: "light", label: "Light", icon: <SunIcon /> },
    { value: "dark", label: "Dark", icon: <MoonIcon /> },
    {
      value: "system",
      label: "System",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]">
          <rect x="3.5" y="4.5" width="17" height="12" rx="2" />
          <path d="M8 19.5h8" />
          <path d="M12 16.5v3" />
        </svg>
      ),
    },
  ];

  const activeOption = options.find((option) => option.value === theme) ?? options[0];
  const previewIcon = theme === "system"
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
        aria-label={`Theme: ${activeOption.label}`}
        aria-expanded={open}
        aria-haspopup="true"
        title={`Theme: ${activeOption.label}`}
      >
        {previewIcon}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[172px] rounded-2xl border border-border bg-card p-1.5 shadow-xl">
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
                {selected ? <span className="text-xs font-semibold text-[color:var(--accent-blue)]">Active</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
