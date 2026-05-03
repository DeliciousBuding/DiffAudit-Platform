"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ClipboardList, FileText, RefreshCw, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { CopyButton } from "@/components/copy-button";
import { EmptyState } from "@/components/empty-state";
import { SortableHeader } from "@/components/sortable-header";
import { StatusBadge } from "@/components/status-badge";
import { InfoTooltip } from "@/components/info-tooltip";
import { densityClass, type Density } from "@/components/table-density-toggle";
import { useSort } from "@/hooks/use-sort";
import { buildCompletedJobReportHref } from "@/lib/audit-flow";
import { formatCompactTime, formatDuration, formatMetricValue } from "@/lib/format";
import { sanitizeRuntimeText } from "@/lib/runtime-text";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export interface JobRecord {
  job_id: string;
  status: string;
  contract_key: string;
  workspace_name: string;
  job_type: string;
  created_at: string;
  updated_at: string;
  target_model?: string | null;
  summary_note?: string | null;
  progress_pct?: number;
  metrics?: {
    auc?: number;
    asr?: number;
    tpr?: number;
  };
  error?: string | null;
}

interface TaskListClientProps {
  mode: "active" | "history";
  locale: Locale;
  filter?: string;
  search?: string;
  jobs: JobRecord[];
  loading: boolean;
  loadError: boolean;
  onRefresh: () => void;
  density?: Density;
}

function statusTone(status: string): "info" | "success" | "warning" | "danger" | "primary" | "neutral" {
  if (status === "completed") return "success";
  if (status === "failed") return "danger";
  if (status === "running") return "info";
  if (status === "queued") return "neutral";
  if (status === "cancelled") return "neutral";
  return "primary";
}

function statusLabel(status: string, labels: Record<string, string>): string {
  return labels[status] ?? status;
}

function ProgressStrip({ value, isActive }: { value: number; isActive?: boolean }) {
  return (
    <div className="mt-2">
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted/40"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${value}%`}
      >
        <div
          className={`h-full rounded-full bg-[var(--accent-blue)] transition-all${isActive ? " progress-strip-active" : ""}`}
          style={{ width: `${Math.max(6, Math.min(100, value))}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{value}%</div>
    </div>
  );
}

export function TaskListClient({ mode, locale, filter, search, jobs: allJobs, loading, loadError, onRefresh, density = "default" }: TaskListClientProps) {
  const copy = WORKSPACE_COPY[locale].audits;
  const tableCopy = copy.taskTable;

  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);

  // Filter by mode (active = running/queued, history = completed/failed/cancelled)
  const modeFiltered =
    mode === "active"
      ? allJobs.filter((j) => j.status === "running" || j.status === "queued")
      : allJobs.filter((j) => j.status === "completed" || j.status === "failed" || j.status === "cancelled");

  // Apply status filter
  const statusFiltered = filter && filter !== "all"
    ? modeFiltered.filter((j) => j.status === filter)
    : modeFiltered;

  // Apply search filter
  const displayed = search
    ? statusFiltered.filter((j) => {
        const q = search.toLowerCase();
        return (
          j.job_id.toLowerCase().includes(q) ||
          j.contract_key.toLowerCase().includes(q) ||
          j.workspace_name.toLowerCase().includes(q) ||
          (j.target_model ?? "").toLowerCase().includes(q)
        );
      })
    : statusFiltered;

  // Sorting for history table
  const sortableDisplayed = useMemo(() => displayed.map((j) => ({
    ...j,
    name: j.job_id,
    model: j.target_model ?? "",
    durationMs: new Date(j.updated_at).getTime() - new Date(j.created_at).getTime(),
  })), [displayed]);
  const { sorted: sortedHistory, sortKey, sortDir, toggleSort } = useSort(sortableDisplayed);

  // Scroll container ref for fade gradient
  const tableScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    function checkScrollable() {
      if (el) {
        el.classList.toggle("is-scrollable", el.scrollWidth > el.clientWidth);
      }
    }
    checkScrollable();
    const observer = new ResizeObserver(checkScrollable);
    observer.observe(el);
    return () => observer.disconnect();
  }, [displayed]);

  async function handleRetry(job: JobRecord) {
    setRetryingJobId(job.job_id);
    setRetryError(null);
    try {
      const res = await fetch("/api/v1/audit/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_key: job.contract_key,
          workspace_name: job.workspace_name,
          job_type: job.job_type,
        }),
      });
      if (res.ok) {
        onRefresh();
      } else {
        setRetryError(`Retry failed (HTTP ${res.status})`);
      }
    } catch {
      setRetryError(locale === "zh-CN" ? "无法连接到服务器" : "Could not reach the server");
    } finally {
      setRetryingJobId(null);
    }
  }

  if (loading) {
    return (
      <div className="divide-y divide-border/30">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="animate-pulse h-3 w-28 rounded-md bg-muted/30" />
              <div className="animate-pulse h-4 w-16 rounded-full bg-muted/30" />
            </div>
            <div className="animate-pulse h-2.5 w-40 rounded-md bg-muted/30" />
            <div className="flex items-center justify-between">
              <div className="animate-pulse h-2.5 w-24 rounded-md bg-muted/30" />
              <div className="animate-pulse h-2.5 w-12 rounded-md bg-muted/30" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <RefreshCw className="mb-2 text-muted-foreground/40" size={28} strokeWidth={1.5} />
        <p className="text-xs text-muted-foreground mb-3">{copy.jobsUnavailable}</p>
        <button
          type="button"
          onClick={onRefresh}
          className="workspace-btn-secondary px-3 py-1.5 text-xs font-medium"
        >
          {copy.retry}
        </button>
      </div>
    );
  }

  if (displayed.length === 0) {
    if (filter && filter !== "all") {
      return (
        <EmptyState
          icon={FileText}
          title={mode === "history" ? copy.emptyHistoryFiltered : copy.emptyJobs}
          description=""
        />
      );
    }
    return (
      <EmptyState
        icon={ClipboardList}
        title={mode === "active" ? copy.emptyTasks : copy.emptyHistory}
        description={mode === "active"
          ? (locale === "zh-CN" ? "创建一个新的审计任务开始检测模型隐私风险。" : "Create a new audit task to start detecting model privacy risks.")
          : copy.emptyHistory}
        action={mode === "active" ? { label: copy.createTask, href: "/workspace/audits/new" } : undefined}
      />
    );
  }

  // Active tasks: compact list with live pulse
  if (mode === "active") {
    return (
      <div className="divide-y divide-border/30">
        {displayed.map((job) => (
          <div key={job.job_id} className="px-4 py-3 transition-colors hover:bg-[color:var(--accent-blue)]/5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="mono text-xs font-medium truncate">{job.job_id}</span>
              <StatusBadge tone={statusTone(job.status)} compact>{statusLabel(job.status, copy.statusLabels)}</StatusBadge>
            </div>
            <div className="mono text-[11px] text-muted-foreground mb-1 truncate">
              {job.contract_key}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate">{job.workspace_name}</span>
              <span className="text-[11px] whitespace-nowrap ml-2">
                {formatDuration(job.created_at, job.updated_at, locale)}
              </span>
            </div>
            {typeof job.progress_pct === "number" && (job.status === "queued" || job.status === "running") && (
              <ProgressStrip value={job.progress_pct} isActive={job.status === "running"} />
            )}
            {job.status === "running" && typeof job.progress_pct === "number" && (
              <div className="mt-1 text-[11px] text-[color:var(--accent-blue)]">
                {locale === "zh-CN" ? `采样中... ${job.progress_pct}%` : `Sampling... ${job.progress_pct}%`}
              </div>
            )}
            {job.status === "queued" && (
              <div className="mt-1 text-[11px] text-muted-foreground">
                {locale === "zh-CN" ? "等待分配..." : "Waiting for allocation..."}
              </div>
            )}
            {job.summary_note && (
              <div className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                {job.summary_note}
              </div>
            )}
            {job.error && (
              <div className="mono mt-1.5 text-[11px] text-[color:var(--warning)] truncate">
                {sanitizeRuntimeText(job.error)}
              </div>
            )}
            <Link
              href={`/workspace/audits/${encodeURIComponent(job.job_id)}`}
              className="mt-2 inline-flex text-[11px] font-medium text-[color:var(--accent-blue)] transition-colors hover:text-foreground"
            >
              {copy.viewDetails}
            </Link>
          </div>
        ))}
      </div>
    );
  }

  // History: full table view
  return (
    <div
      ref={tableScrollRef}
      className="workspace-table-scroll"
      role="region"
      aria-label={tableCopy.name}
    >
      <table className={`workspace-data-table w-full border-collapse text-[13px] ${densityClass(density)}`}>
        <thead className="sticky top-0 bg-muted/30">
          <tr className="border-b border-border">
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground min-w-[200px]">{tableCopy.name}</th>
            <SortableHeader label={tableCopy.type} sortKey="job_type" currentSort={sortKey} currentDir={sortDir} onSort={toggleSort} />
            <SortableHeader label={tableCopy.model} sortKey="model" currentSort={sortKey} currentDir={sortDir} onSort={toggleSort} />
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground min-w-[90px]">{tableCopy.status}</th>
            <SortableHeader label={tableCopy.created} sortKey="created_at" currentSort={sortKey} currentDir={sortDir} onSort={toggleSort} />
            <th scope="col" className="px-4 py-3 text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort("durationMs")}>
              <span className="inline-flex items-center gap-1 justify-end">
                {tableCopy.duration}
                {sortKey === "durationMs" ? (
                  sortDir === "asc" ? <ChevronUp size={12} strokeWidth={1.5} /> : <ChevronDown size={12} strokeWidth={1.5} />
                ) : (
                  <ChevronsUpDown size={12} strokeWidth={1.5} className="opacity-30" />
                )}
              </span>
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.action}</th>
          </tr>
        </thead>
        <tbody>
          {sortedHistory.map((job, index) => {
              const reportHref = buildCompletedJobReportHref(job);

              return (
                <tr
                  key={job.job_id}
                  className="table-row-hover border-b border-border transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-xs whitespace-nowrap">{job.job_id}</span>
                      <CopyButton text={job.job_id} label="job ID" />
                    </div>
                    <div className="mono text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">{job.contract_key}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{job.job_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="mono text-xs whitespace-nowrap">{job.target_model ?? "--"}</span>
                    {job.summary_note && (
                      <div className="mt-1 text-[11px] leading-4 text-muted-foreground max-w-[18rem]">
                        {job.summary_note}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={statusTone(job.status)} compact>{statusLabel(job.status, copy.statusLabels)}</StatusBadge>
                    {typeof job.progress_pct === "number" && (job.status === "queued" || job.status === "running") && (
                      <div className="mt-1">
                        <ProgressStrip value={job.progress_pct} isActive={job.status === "running"} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="mono text-xs text-muted-foreground">{formatCompactTime(job.created_at, locale)}</span>
                  </td>
                  <td className="mono px-4 py-3 text-right text-xs">
                    {formatDuration(job.created_at, job.updated_at, locale)}
                    {job.metrics && (
                      <div className="mt-1 text-[11px] leading-4 text-muted-foreground">
                        {index === 0 ? (
                          <InfoTooltip content={WORKSPACE_COPY[locale].tooltips.auc}>{tableCopy.auc}</InfoTooltip>
                        ) : tableCopy.auc} {formatMetricValue(job.metrics.auc)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/workspace/audits/${encodeURIComponent(job.job_id)}`}
                        className="text-xs text-[color:var(--accent-blue)] transition-colors hover:underline"
                      >
                        {copy.viewDetails}
                      </Link>
                      {reportHref ? (
                        <Link
                          href={reportHref}
                          className="text-xs text-[color:var(--accent-blue)] transition-colors hover:underline"
                        >
                          {copy.viewReport}
                        </Link>
                      ) : null}
                      {job.status === "failed" && (
                        <>
                          <button
                            onClick={() => handleRetry(job)}
                            disabled={retryingJobId === job.job_id}
                            className="text-xs text-[color:var(--warning)] hover:underline disabled:opacity-50"
                            title={copy.retryTitle}
                          >
                            {retryingJobId === job.job_id ? copy.retrying : copy.retry}
                          </button>
                          {retryError && retryingJobId === null && (
                            <span className="text-[11px] text-[color:var(--risk-high)]">{retryError}</span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
