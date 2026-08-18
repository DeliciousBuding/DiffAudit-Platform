import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * StatusBadge — thin wrapper over the `<Badge>` primitive.
 *
 * The legacy tone taxonomy (primary/success/warning/danger/info/neutral) maps
 * onto the sanctioned Badge variants; `compact` toggles the tighter padding
 * for table cells. No separate visual language — this is the only status pill.
 */
type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  compact?: boolean;
};

const TONE_TO_VARIANT: Record<
  NonNullable<StatusBadgeProps["tone"]>,
  NonNullable<React.ComponentProps<typeof Badge>["variant"]>
> = {
  primary: "default",
  success: "success",
  warning: "warning",
  danger: "destructive",
  info: "info",
  neutral: "secondary",
};

export function StatusBadge({
  children,
  tone = "primary",
  compact = false,
}: StatusBadgeProps) {
  return (
    <Badge
      variant={TONE_TO_VARIANT[tone]}
      className={cn(!compact && "px-3 py-1.5 gap-2")}
    >
      {children}
    </Badge>
  );
}
