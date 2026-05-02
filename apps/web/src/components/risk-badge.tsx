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
        className="risk-badge-compact"
        title={displayLabel}
        aria-label={displayLabel}
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: config.color,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <span
      className="risk-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        borderRadius: 9999,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        color: config.color,
        background: config.bg,
        border: `1px solid transparent`,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: config.color,
          flexShrink: 0,
        }}
      />
      {displayLabel}
    </span>
  );
}
