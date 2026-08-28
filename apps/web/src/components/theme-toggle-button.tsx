"use client";

import { useEffect, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";
import type { ThemeMode } from "@/lib/theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeToggleLabels = {
  light: string;
  dark: string;
  system: string;
  prefix: string;
};

const DEFAULT_LABELS: ThemeToggleLabels = {
  light: "Light",
  dark: "Dark",
  system: "System",
  prefix: "Theme",
};

const ICON_STROKE = { strokeWidth: 1.5 } as const;

/**
 * ThemeToggleButton — the workspace theme control.
 *
 * Migrated from the hand-rolled `useFloatingMenu` menu + inline SVG icons to
 * the Base UI-backed `DropdownMenu` primitive + Lucide icons. Behaviour is
 * unchanged (light / dark / system, with the active value marked), but the
 * menu now gets focus-trap, Escape, outside-click, arrow nav, and portal
 * collision-aware placement for free — and the icon language is consistent
 * with the rest of the design system.
 *
 * The trigger keeps the legacy `header-pill` classes so it stays visually
 * consistent with the (still legacy) shell until the shell migrates to the
 * shadcn sidebar block. A `mounted` gate avoids an SSR/hydration mismatch on
 * the preview icon, since next-themes resolves the theme on the client.
 */
export function ThemeToggleButton({ labels }: { labels?: Partial<ThemeToggleLabels> } = {}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mergedLabels = { ...DEFAULT_LABELS, ...labels };

  const options: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
    { value: "light", label: mergedLabels.light, icon: Sun },
    { value: "dark", label: mergedLabels.dark, icon: Moon },
    { value: "system", label: mergedLabels.system, icon: Monitor },
  ];

  const activeOption = options.find((option) => option.value === theme) ?? options[2];
  const PreviewIcon = mounted ? activeOption.icon : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="header-pill header-pill-icon text-muted-foreground hover:text-foreground"
            aria-label={`${mergedLabels.prefix}: ${activeOption.label}`}
            title={`${mergedLabels.prefix}: ${activeOption.label}`}
          />
        }
      >
        <PreviewIcon {...ICON_STROKE} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[172px]">
        <DropdownMenuLabel>{mergedLabels.prefix}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const selected = mounted && theme === option.value;
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
            >
              <Icon {...ICON_STROKE} />
              <span>{option.label}</span>
              {selected ? <Check strokeWidth={2} className="ml-auto text-primary" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
