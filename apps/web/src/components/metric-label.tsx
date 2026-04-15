"use client";

import { Tooltip } from "@/components/tooltip";

interface MetricLabelProps {
  label: string;
  tooltip: string;
  className?: string;
}

export function MetricLabel({ label, tooltip, className }: MetricLabelProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      {label}
      <Tooltip content={tooltip} position="top">
        <span
          className="inline-flex items-center justify-center text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-help"
          aria-label={`Info: ${tooltip}`}
        >
          ⓘ
        </span>
      </Tooltip>
    </span>
  );
}
