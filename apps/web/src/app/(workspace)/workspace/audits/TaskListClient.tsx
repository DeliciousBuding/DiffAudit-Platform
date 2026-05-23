"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Eye, Search, Shield, ClipboardList, RefreshCw } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/components/toast-provider";
import { buildCompletedJobReportHref } from "@/lib/audit-flow";
import { formatCompactTime, formatDuration, formatMetricValue } from "@/lib/format";
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

type Tone = "blue" | "green" | "purple" | "orange" | "muted";

function trackTone(job: JobRecord): Tone {
  const key = `${job.contract_key} ${job.job_type}`.toLowerCase();
  if (key.includes("gsa")) return "green";
  if (key.includes("pia")) return "purple";
  if (key.includes("recon")) return "blue";
  if (key.includes("audio")) return "orange";
  return "muted";
}

function TrackIcon({ tone, size }: { tone: Tone; size: number }) {
  const props = { size, strokeWidth: 1.7, "aria-hidden": true as const };
  if (tone === "green") return <Shield {...props} />;
  if (tone === "purple") return <Eye {...props} />;
  if (tone === "blue") return <Activity {...props} />;
  if (tone === "orange") return <Search {...props} />;
  return <Activity {...props} />;
}

function statusToneClass(status: string): string {
  if (status === "completed") return "is-success";
  if (status === "failed") return "is-danger";
  if (status === "running" || status === "queued") return "is-info";
  if (status === "cancelled") return "is-muted";
  return "is-muted";
}

function formatRemaining(progressPct: number, createdAt: string, locale: Locale, nowMs: number): string {
  if (progressPct <= 0 || progressPct >= 100) return "";
  const elapsed = nowMs - new Date(createdAt).getTime();
  if (!isFinite(elapsed) || elapsed <= 0) return "";
  const totalEstimate = elapsed / (progressPct / 100);
  const remainingMs = Math.max(0, totalEstimate - elapsed);
  const remainingSec = Math.round(remainingMs / 1000);
  const m = Math.floor(remainingSec / 60);
  const s = remainingSec % 60;
  const copy = WORKSPACE_COPY[locale].audits;
  return m > 0 ? copy.remainingMinutes(m, s) : copy.remainingSeconds(s);
}

export function RunningCard({ job, locale }: { job: JobRecord; locale: Locale }) {
  const copy = WORKSPACE_COPY[locale].audits;
  const tone = trackTone(job);
  const pct = typeof job.progress_pct === "number" ? Math.round(job.progress_pct) : 0;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = formatRemaining(pct, job.created_at, locale, now);
  const runningLabel = copy.runningLabel(pct);

  return (
    <Link
      href={`/workspace/audits/${encodeURIComponent(job.job_id)}`}
      className="audits-running-card"
    >
      <span className={`audits-running-icon is-${tone}`}>
        <TrackIcon tone={tone} size={16} />
      </span>
      <div className="audits-running-info">
        <div className="audits-running-title">
          <strong>{job.job_id}</strong>
          <span>{job.target_model ?? job.contract_key}</span>
        </div>
        <small className="mono">{job.contract_key}</small>
        <div className="audits-running-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={copy.viewDetails}>
          <span style={{ width: `${Math.max(4, Math.min(100, pct))}%` }} />
        </div>
        <div className="audits-running-meta">
          <span>{runningLabel}</span>
          {remaining ? <span>{remaining}</span> : null}
        </div>
      </div>
    </Link>
  );
}

interface HistoryTableProps {
  jobs: JobRecord[];
  locale: Locale;
  loading: boolean;
  loadError: boolean;
  onRefresh: () => void;
}

export function HistoryTable({ jobs, locale, loading, loadError, onRefresh }: HistoryTableProps) {
  const copy = WORKSPACE_COPY[locale].audits;
  const tableCopy = copy.taskTable;
  const { toast } = useToast();
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const pageJobs = jobs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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
      } else {
        toast({ type: "error", title: copy.toastRetryFailed(res.status) });
      }
    } catch {
      toast({ type: "error", title: copy.toastServerUnreachable });
    } finally {
      setRetryingJobId(null);
    }
  }

  if (loading) {
    return (
      <div className="audits-history-skeleton">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-12 rounded-md bg-muted/30" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <RefreshCw className="mb-2 text-muted-foreground/40" size={28} strokeWidth={1.5} />
        <p className="text-xs text-muted-foreground mb-3">{copy.jobsUnavailable}</p>
        <button type="button" onClick={onRefresh} className="audits-create-btn is-secondary">
          {copy.retry}
        </button>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title={copy.emptyHistory}
        description=""
        action={{ label: copy.createTaskButton, href: "/workspace/audits/new" }}
      />
    );
  }

  return (
    <div className="audits-history-table-wrap">
      <table className="audits-history-table">
        <thead>
          <tr>
            <th>{tableCopy.name}</th>
            <th>{tableCopy.type}</th>
            <th>{tableCopy.model}</th>
            <th>{tableCopy.status}</th>
            <th>{tableCopy.created}</th>
            <th>{tableCopy.duration}</th>
            <th className="text-right">{tableCopy.action}</th>
          </tr>
        </thead>
        <tbody>
          {pageJobs.map((job) => {
            const tone = trackTone(job);
            const reportHref = buildCompletedJobReportHref(job);
            return (
              <tr key={job.job_id}>
                <td>
                  <div className="audits-cell-task">
                    <span className={`audits-running-icon is-${tone} is-sm`}>
                      <TrackIcon tone={tone} size={13} />
                    </span>
                    <div>
                      <strong>{job.job_id}</strong>
                      <small className="mono">{job.contract_key}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="mono audits-cell-muted">{job.job_type}</span>
                </td>
                <td>
                  <div className="audits-cell-model">
                    <span className="mono">{job.target_model ?? "--"}</span>
                    {job.summary_note ? <small>{job.summary_note}</small> : null}
                  </div>
                </td>
                <td>
                  <span className={`audits-status-pill ${statusToneClass(job.status)}`}>
                    {copy.statusLabels[job.status] ?? job.status}
                  </span>
                </td>
                <td>
                  <span className="mono audits-cell-muted">{formatCompactTime(job.created_at, locale)}</span>
                </td>
                <td>
                  <div className="audits-cell-duration">
                    <span className="mono">{formatDuration(job.created_at, job.updated_at, locale)}</span>
                    {job.metrics?.auc !== undefined ? (
                      <small className="mono">AUC {formatMetricValue(job.metrics.auc)}</small>
                    ) : null}
                  </div>
                </td>
                <td className="text-right">
                  <div className="audits-cell-actions">
                    <Link href={`/workspace/audits/${encodeURIComponent(job.job_id)}`}>{copy.viewDetails}</Link>
                    {reportHref ? <Link href={reportHref}>{copy.viewReport}</Link> : null}
                    {job.status === "failed" ? (
                      <button
                        type="button"
                        onClick={() => handleRetry(job)}
                        disabled={retryingJobId === job.job_id}
                        className="audits-cell-retry"
                      >
                        {retryingJobId === job.job_id ? copy.retrying : copy.retry}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <footer className="audits-history-footer">
        <span>{copy.paginationTotal(jobs.length)}</span>
        {totalPages > 1 ? (
        <div className="audits-pagination">
          <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label="prev">‹</button>
          <span className="is-active">{page + 1} / {totalPages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} aria-label="next">›</button>
        </div>
        ) : null}
        <span>{copy.paginationPerPage}</span>
      </footer>
    </div>
  );
}
