"use client";

import { useRef, useCallback } from "react";

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
  idPrefix: string;
}

export function Tabs({ value, onChange, tabs, variant = "inline", className, idPrefix }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = tabs.findIndex((t) => t.value === value);
      if (!tabs.length || idx < 0) {
        return;
      }
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
        const nextValue = tabs[next].value;
        onChange(nextValue);
        buttonRefs.current[nextValue]?.focus();
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
        const tabId = `${idPrefix}-${tab.value}`;
        const panelId = `${idPrefix}-panel-${tab.value}`;
        return (
          <button
            key={tab.value}
            id={tabId}
            ref={(node) => {
              buttonRefs.current[tab.value] = node;
            }}
            data-value={tab.value}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            aria-controls={panelId}
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
                className="tabs-underline absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent-blue)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  value: string;
  activeValue: string;
  children: React.ReactNode;
  className?: string;
  idPrefix: string;
}

export function TabPanel({ value, activeValue, children, className, idPrefix }: TabPanelProps) {
  if (value !== activeValue) return null;
  const tabId = `${idPrefix}-${value}`;
  const panelId = `${idPrefix}-panel-${value}`;
  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      className={className}
    >
      {children}
    </div>
  );
}
