"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight, RefreshCw } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { InfoTooltip } from "@/components/info-tooltip";
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

function ProgressStrip({ value }: { value: number }) {
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
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="mb-2 text-muted-foreground/30" size={28} strokeWidth={1.2} />
          <p className="text-xs text-muted-foreground">
            {mode === "history" ? copy.emptyHistoryFiltered : copy.emptyJobs}
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="mb-2 text-muted-foreground/30" size={28} strokeWidth={1.2} />
        <p className="text-xs text-muted-foreground mb-3">
          {mode === "active" ? copy.emptyTasks : copy.emptyHistory}
        </p>
        {mode === "active" && (
          <Link
            href="/workspace/audits/new"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-blue)] hover:underline"
          >
            {copy.createTask}
            <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
        )}
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
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground min-w-[200px]">{tableCopy.name}</th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.type}</th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.model}</th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.status}</th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.created}</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.duration}</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{tableCopy.action}</th>
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
                    <span className="mono text-xs text-muted-foreground">{formatCompactTime(job.created_at, locale)}</span>
                  </td>
                  <td className="mono px-4 py-3 text-right text-xs">
                    {formatDuration(job.created_at, job.updated_at, locale)}
                    {job.metrics && (
                      <div className="mt-1 text-[10px] leading-4 text-muted-foreground">
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
