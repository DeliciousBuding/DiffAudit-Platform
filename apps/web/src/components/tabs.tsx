"use client";

import { useRef, useEffect, useCallback } from "react";

interface TabDef {
  value: string;
  label: string;
}

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  tabs: TabDef[];
  variant?: "inline" | "full-width";
  className?: string;
}

export function Tabs({ value, onChange, tabs, variant = "inline", className }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = tabs.findIndex((t) => t.value === value);
      let next = idx;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        next = (idx + 1) % tabs.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        next = (idx - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        next = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        next = tabs.length - 1;
      }
      if (next !== idx) {
        onChange(tabs[next].value);
        const btn = listRef.current?.querySelector<HTMLButtonElement>(
          `[data-value="${tabs[next].value}"]`
        );
        btn?.focus();
      }
    },
    [tabs, value, onChange]
  );

  const baseClasses =
    "relative flex items-center gap-0 text-sm font-medium border-b border-[var(--color-border-subtle)]";
  const variantClasses =
    variant === "full-width" ? "w-full" : "w-fit";

  return (
    <div ref={listRef} className={`${baseClasses} ${variantClasses} ${className ?? ""}`} role="tablist" onKeyDown={handleKeyDown}>
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            data-value={tab.value}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.value}`}
            onClick={() => onChange(tab.value)}
            className={`relative px-4 py-2.5 transition-colors ${
              isActive
                ? "text-[var(--color-text-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent-blue)]"
                style={{ animation: "tabs-underline 0.15s ease-out forwards" }}
              />
            )}
          </button>
        );
      })}
      <style>{`
        @keyframes tabs-underline {
          from { transform: scaleX(0.6); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

interface TabPanelProps {
  value: string;
  activeValue: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ value, activeValue, children, className }: TabPanelProps) {
  if (value !== activeValue) return null;
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      className={className}
    >
      {children}
    </div>
  );
}
