"use client";

import { useState } from "react";

import { type Locale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

type AuditToolbarProps = {
  onRefresh?: () => void;
  locale?: Locale;
};

export function AuditToolbar({ onRefresh, locale = "en-US" }: AuditToolbarProps) {
  const copy = WORKSPACE_COPY[locale].audits;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing || !onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/20 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{copy.eyebrow}</span>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            {copy.updatedAt}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-info animate-pulse" />
        {copy.jobsRefreshNote}
      </div>
    </div>
  );
}
