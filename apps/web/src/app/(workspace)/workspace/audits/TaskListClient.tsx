"use client";

import { useState } from "react";
import Link from "next/link";

import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { buildCompletedJobReportHref } from "@/lib/audit-flow";
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
}

function statusTone(status: string): "info" | "success" | "warning" | "primary" | "neutral" {
  if (status === "completed") return "success";
  if (status === "failed") return "warning";
  if (status === "running") return "info";
  if (status === "cancelled") return "neutral";
  return "primary";
}

function statusLabel(status: string, labels: Record<string, string>): string {
  return labels[status] ?? status;
}

function formatTime(iso: string, locale: Locale): string {
  try {
    const tag = locale === "zh-CN" ? "zh-CN" : "en-US";
    return new Date(iso).toLocaleString(tag, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function formatDuration(created: string, updated: string | null, locale: Locale = "en-US"): string {
  const start = new Date(created).getTime();
  const end = updated ? new Date(updated).getTime() : Date.now();
  const diffMs = Math.max(0, end - start);
  const secs = Math.floor(diffMs / 1000);
  const isZh = locale === "zh-CN";
  if (secs < 60) return isZh ? `${secs}秒` : `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return isZh ? `${mins}分${secs % 60}秒` : `${mins}m ${secs % 60}s`;
  const hours = Math.floor(mins / 60);
  return isZh ? `${hours}时${mins % 60}分` : `${hours}h ${mins % 60}m`;
}

function formatMetricValue(value: number | undefined, digits = 3) {
  return typeof value === "number" ? value.toFixed(digits) : "--";
}

function ProgressStrip({ value }: { value: number }) {
  return (
    <div className="mt-2">
      <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
        <div
          className="h-full rounded-full bg-[var(--accent-blue)] transition-all"
          style={{ width: `${Math.max(6, Math.min(100, value))}%` }}
        />
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">{value}%</div>
    </div>
  );
}

export function TaskListClient({ mode, locale, filter, search, jobs: allJobs, loading, loadError, onRefresh }: TaskListClientProps) {
  const copy = WORKSPACE_COPY[locale].audits;
  const tableCopy = copy.taskTable;

  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);

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

  async function handleRetry(job: JobRecord) {
    setRetryingJobId(job.job_id);
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
      }
    } catch {
      // Ignore — user can try again
    } finally {
      setRetryingJobId(null);
    }
  }

  if (loading) {
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground text-center">
        {copy.jobsRefreshNote}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="px-3 py-4 text-center text-xs text-muted-foreground">
        <div>{copy.jobsUnavailable}</div>
        <button
          type="button"
          onClick={onRefresh}
          className="workspace-btn-secondary mt-3 px-3 py-2 text-xs font-medium"
        >
          {copy.retry}
        </button>
      </div>
    );
  }

  if (displayed.length === 0) {
    if (filter && filter !== "all") {
      return (
        <div className="px-3 py-4 text-xs text-muted-foreground text-center">
          {mode === "history" ? copy.emptyHistoryFiltered : copy.emptyJobs}
        </div>
      );
    }
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground text-center">
        {mode === "active" ? copy.emptyTasks : copy.emptyHistory}
      </div>
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
            <div className="mono text-[10px] text-muted-foreground mb-1 truncate">
              {job.contract_key}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate">{job.workspace_name}</span>
              <span className="text-[10px] whitespace-nowrap ml-2">
                {formatDuration(job.created_at, job.updated_at, locale)}
              </span>
            </div>
            {typeof job.progress_pct === "number" && (job.status === "queued" || job.status === "running") && (
              <ProgressStrip value={job.progress_pct} />
            )}
            {job.summary_note && (
              <div className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                {job.summary_note}
              </div>
            )}
            {job.error && (
              <div className="mono mt-1.5 text-[10px] text-[color:var(--warning)] truncate">
                {sanitizeRuntimeText(job.error)}
              </div>
            )}
            <Link
              href={`/workspace/audits/${encodeURIComponent(job.job_id)}`}
              className="mt-2 inline-flex text-[11px] font-medium text-[var(--accent-blue)] transition-colors hover:text-foreground"
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
    <div className="overflow-x-auto">
      <table className="workspace-data-table w-full border-collapse text-[13px]">
        <thead className="sticky top-0 bg-muted/30">
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground min-w-[200px]">{tableCopy.name}</th>
            <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.type}</th>
            <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.model}</th>
            <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.status}</th>
            <th className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.created}</th>
            <th className="px-4 py-3 text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.duration}</th>
            <th className="px-4 py-3 text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.action}</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map((job, index) => {
              const reportHref = buildCompletedJobReportHref(job);

              return (
                <tr
                  key={job.job_id}
                  className="table-row-hover border-b border-border transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-xs whitespace-nowrap">{job.job_id}</div>
                    <div className="mono text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">{job.contract_key}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{job.job_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="mono text-xs whitespace-nowrap">{job.target_model ?? "--"}</span>
                    {job.summary_note && (
                      <div className="mt-1 text-[10px] leading-4 text-muted-foreground max-w-[18rem]">
                        {job.summary_note}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={statusTone(job.status)} compact>{statusLabel(job.status, copy.statusLabels)}</StatusBadge>
                    {typeof job.progress_pct === "number" && (job.status === "queued" || job.status === "running") && (
                      <div className="mt-1">
                        <ProgressStrip value={job.progress_pct} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="mono text-xs text-muted-foreground">{formatTime(job.created_at, locale)}</span>
                  </td>
                  <td className="mono px-4 py-3 text-right text-xs">
                    {formatDuration(job.created_at, job.updated_at, locale)}
                    {job.metrics && (
                      <div className="mt-1 text-[10px] leading-4 text-muted-foreground">
                        {tableCopy.auc} {formatMetricValue(job.metrics.auc)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/workspace/audits/${encodeURIComponent(job.job_id)}`}
                        className="text-xs text-[var(--accent-blue)] hover:underline"
                      >
                        {copy.viewDetails}
                      </Link>
                      {reportHref ? (
                        <Link
                          href={reportHref}
                          className="text-xs text-[var(--accent-blue)] hover:underline"
                        >
                          {copy.viewReport}
                        </Link>
                      ) : null}
                      {job.status === "failed" && (
                        <button
                          onClick={() => handleRetry(job)}
                          disabled={retryingJobId === job.job_id}
                          className="text-xs text-[color:var(--warning)] hover:underline disabled:opacity-50"
                          title={copy.retryTitle}
                        >
                          {retryingJobId === job.job_id ? copy.retrying : copy.retry}
                        </button>
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
