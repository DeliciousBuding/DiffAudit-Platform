"use client";

import { classifyRisk, type RiskLevel } from "@/lib/risk-report";

type RiskBadgeProps = {
  auc: number;
  label?: string;
  compact?: boolean;
};

const LEVEL_CONFIG: Record<
  RiskLevel,
  { text: string; color: string; bg: string }
> = {
  high: {
    text: "High risk",
    color: "var(--risk-high)",
    bg: "var(--risk-high-bg)",
  },
  medium: {
    text: "Medium risk",
    color: "var(--risk-medium)",
    bg: "var(--risk-medium-bg)",
  },
  low: {
    text: "Low risk",
    color: "var(--risk-low)",
    bg: "var(--risk-low-bg)",
  },
};

export function RiskBadge({ auc, label, compact = false }: RiskBadgeProps) {
  const level = classifyRisk(auc);
  const config = LEVEL_CONFIG[level];
  const displayLabel = label ?? config.text;

  if (compact) {
    return (
      <span
        className="risk-badge-compact"
        title={displayLabel}
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
        gap: 6,
        borderRadius: 9999,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.bg}`,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: config.color,
          flexShrink: 0,
        }}
      />
      {displayLabel}
    </span>
  );
}
