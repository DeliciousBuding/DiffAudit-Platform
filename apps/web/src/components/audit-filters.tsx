"use client";

import { useCallback, useMemo, useState } from "react";

import { type Locale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export type AuditStatusFilter = "all" | "completed" | "failed" | "running";
export type AuditTrackFilter = "all" | "black-box" | "gray-box" | "white-box";

export type AuditFilterState = {
  status: AuditStatusFilter;
  track: AuditTrackFilter;
  search: string;
};

type AuditFiltersProps = {
  locale?: Locale;
  onFilterChange?: (filters: AuditFilterState) => void;
};

const STATUS_OPTIONS: AuditStatusFilter[] = ["all", "completed", "failed", "running"];
const TRACK_OPTIONS: AuditTrackFilter[] = ["all", "black-box", "gray-box", "white-box"];

export function AuditFilters({ locale = "en-US", onFilterChange }: AuditFiltersProps) {
  const copy = WORKSPACE_COPY[locale].audits.filters;
  const [status, setStatus] = useState<AuditStatusFilter>("all");
  const [track, setTrack] = useState<AuditTrackFilter>("all");
  const [search, setSearch] = useState("");

  const activeCount = useMemo(() => {
    let count = 0;
    if (status !== "all") count++;
    if (track !== "all") count++;
    if (search.trim() !== "") count++;
    return count;
  }, [status, track, search]);

  const emitChange = useCallback(
    (next: AuditFilterState) => {
      onFilterChange?.(next);
    },
    [onFilterChange],
  );

  const handleStatusChange = useCallback(
    (value: AuditStatusFilter) => {
      setStatus(value);
      emitChange({ status: value, track, search });
    },
    [track, search, emitChange],
  );

  const handleTrackChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as AuditTrackFilter;
      setTrack(value);
      emitChange({ status, track: value, search });
    },
    [status, search, emitChange],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);
      emitChange({ status, track, search: value });
    },
    [status, track, emitChange],
  );

  const statusLabelMap: Record<AuditStatusFilter, string> = {
    all: copy.statusAll,
    completed: copy.statusCompleted,
    failed: copy.statusFailed,
    running: copy.statusRunning,
  };

  const trackLabelMap: Record<AuditTrackFilter, string> = {
    all: copy.trackAll,
    "black-box": copy.trackBlackBox,
    "gray-box": copy.trackGrayBox,
    "white-box": copy.trackWhiteBox,
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {/* Status pills */}
      <div className="flex items-center gap-1">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleStatusChange(option)}
            className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
              status === option
                ? "bg-[var(--info-soft)] text-[var(--info)] border border-[rgba(47,109,246,0.2)]"
                : "bg-transparent text-muted-foreground border border-transparent hover:bg-muted/40 hover:border-border"
            }`}
          >
            {statusLabelMap[option]}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-border" />

      {/* Track dropdown */}
      <select
        id="audit-track-filter"
        aria-label={copy.trackFilterLabel}
        value={track}
        onChange={handleTrackChange}
        className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground outline-none transition-colors hover:bg-muted/40 focus:border-[rgba(47,109,246,0.52)] focus:ring-2 focus:ring-[rgba(47,109,246,0.08)]"
      >
        {TRACK_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {trackLabelMap[option]}
          </option>
        ))}
      </select>

      {/* Divider */}
      <div className="h-4 w-px bg-border" />

      {/* Search input */}
      <div className="relative flex-1 max-w-[220px]">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none select-none">&#x2315;</span>
        <input
          id="audit-filter-search"
          type="text"
          aria-label={copy.searchLabel}
          value={search}
          onChange={handleSearchChange}
          placeholder={copy.searchPlaceholder}
          className="w-full rounded-md border border-border bg-background py-1 pl-6 pr-2 text-[11px] text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:bg-muted/40 focus:border-[rgba(47,109,246,0.52)] focus:ring-2 focus:ring-[rgba(47,109,246,0.08)]"
        />
      </div>

      {/* Active filter count badge */}
      {activeCount > 0 && (
        <span className="inline-flex items-center rounded-full bg-[var(--info-soft)] border border-[rgba(47,109,246,0.2)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--info)]">
          {activeCount} {copy.activeFilters}
        </span>
      )}
    </div>
  );
}
