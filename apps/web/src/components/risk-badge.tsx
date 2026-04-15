"use client";

import { classifyRisk, type RiskLevel } from "@/lib/risk-report";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import type { Locale } from "@/components/language-picker";

type RiskBadgeProps = {
  auc: number;
  label?: string;
  compact?: boolean;
  locale?: Locale;
};

const LEVEL_CONFIG: Record<
  RiskLevel,
  { color: string; bg: string }
> = {
  high: {
    color: "var(--risk-high)",
    bg: "var(--risk-high-bg)",
  },
  medium: {
    color: "var(--risk-medium)",
    bg: "var(--risk-medium-bg)",
  },
  low: {
    color: "var(--risk-low)",
    bg: "var(--risk-low-bg)",
  },
};

export function RiskBadge({ auc, label, compact = false, locale = "en-US" }: RiskBadgeProps) {
  const level = classifyRisk(auc);
  const config = LEVEL_CONFIG[level];
  const copy = WORKSPACE_COPY[locale].workspace.riskBadgeLabels;
  const fallbackLabels: Record<RiskLevel, string> = {
    high: copy.high,
    medium: copy.medium,
    low: copy.low,
  };
  const displayLabel = label ?? fallbackLabels[level];

  if (compact) {
    return (
      <span
        className="inline-block h-2 w-2 rounded-full flex-shrink-0"
        title={displayLabel}
        style={{
          background: config.color,
        }}
      />
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold leading-none whitespace-nowrap"
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.bg}`,
      }}
    >
      <span
        className="inline-block h-[7px] w-[7px] rounded-full flex-shrink-0"
        style={{
          background: config.color,
        }}
      />
      {displayLabel}
    </span>
  );
}
