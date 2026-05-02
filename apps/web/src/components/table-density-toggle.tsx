"use client";

import { AlignJustify, AlignCenter, AlignLeft } from "lucide-react";

export type Density = "compact" | "default" | "comfortable";

export function TableDensityToggle({
  density,
  onChange,
}: {
  density: Density;
  onChange: (d: Density) => void;
}) {
  const options: { value: Density; icon: typeof AlignJustify; label: string }[] = [
    { value: "compact", icon: AlignJustify, label: "Compact" },
    { value: "default", icon: AlignCenter, label: "Default" },
    { value: "comfortable", icon: AlignLeft, label: "Comfortable" },
  ];
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-card p-0.5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`rounded-md px-2 py-1 transition-colors ${
            density === value
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label={label}
          title={label}
        >
          <Icon size={14} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

/**
 * Read persisted density from localStorage. Returns "default" if unavailable.
 */
export function readPersistedDensity(storageKey: string): Density {
  if (typeof window === "undefined") return "default";
  const v = localStorage.getItem(storageKey);
  if (v === "compact" || v === "default" || v === "comfortable") return v;
  return "default";
}

/**
 * Map density value to a CSS class name for table rows.
 */
export function densityClass(density: Density): string {
  if (density === "compact") return "table-density-compact";
  if (density === "comfortable") return "table-density-comfortable";
  return "";
}
