"use client";

import { Badge } from "@/components/ui/badge";
import { classifyRisk, type RiskLevel } from "@/lib/risk-report";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import type { Locale } from "@/components/language-picker";

/**
 * RiskBadge — AUC → risk level pill over the `<Badge>` primitive.
 *
 * The non-compact form is a Badge (high/medium/low variant) with a dot that
 * inherits the variant's text color via `currentColor`. The compact form is a
 * bare 8px dot for dense table cells — there's no dot variant on the
 * primitive, so the compact path keeps a styled span.
 */
type RiskBadgeProps = {
  auc: number;
  label?: string;
  compact?: boolean;
  locale?: Locale;
};

const LEVEL_TO_VARIANT: Record<RiskLevel, "high" | "medium" | "low"> = {
  high: "high",
  medium: "medium",
  low: "low",
};

const LEVEL_COLOR: Record<RiskLevel, string> = {
  high: "var(--risk-high)",
  medium: "var(--risk-medium)",
  low: "var(--risk-low)",
};

export function RiskBadge({
  auc,
  label,
  compact = false,
  locale = "en-US",
}: RiskBadgeProps) {
  const level = classifyRisk(auc);
  const copy = WORKSPACE_COPY[locale].workspace.riskBadgeLabels;
  const displayLabel = label ?? copy[level];

  if (compact) {
    return (
      <span
        title={displayLabel}
        aria-label={displayLabel}
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ background: LEVEL_COLOR[level] }}
      />
    );
  }

  return (
    <Badge variant={LEVEL_TO_VARIANT[level]}>
      <span
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: "currentColor" }}
      />
      {displayLabel}
    </Badge>
  );
}
