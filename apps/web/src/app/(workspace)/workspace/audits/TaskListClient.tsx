"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

interface JobRecord {
  job_id: string;
  status: string;
  contract_key: string;
  workspace_name: string;
  job_type: string;
  created_at: string;
  updated_at: string;
  target_model?: string | null;
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

function formatDuration(created: string, updated: string | null): string {
  const start = new Date(created).getTime();
  const end = updated ? new Date(updated).getTime() : Date.now();
  const diffMs = Math.max(0, end - start);
  const secs = Math.floor(diffMs / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${secs % 60}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

// Demo mode: generate mock jobs for demonstration
function generateDemoJobs(mode: "active" | "history"): JobRecord[] {
  const now = Date.now();
  const demoJobs: JobRecord[] = [
    {
      job_id: "demo-job-001",
      status: "running",
      contract_key: "stable-diffusion-v1-4",
      workspace_name: "demo-workspace",
      job_type: "black-box",
      created_at: new Date(now - 120000).toISOString(),
      updated_at: new Date(now - 60000).toISOString(),
      target_model: "stable-diffusion-v1-4",
    },
    {
      job_id: "demo-job-002",
      status: "queued",
      contract_key: "pixel-art-v2",
      workspace_name: "demo-workspace",
      job_type: "gray-box",
      created_at: new Date(now - 30000).toISOString(),
      updated_at: new Date(now - 30000).toISOString(),
      target_model: "pixel-art-v2",
    },
    {
      job_id: "demo-job-003",
      status: "completed",
      contract_key: "stable-diffusion-v1-4",
      workspace_name: "demo-workspace",
      job_type: "black-box",
      created_at: new Date(now - 3600000).toISOString(),
      updated_at: new Date(now - 3000000).toISOString(),
      target_model: "stable-diffusion-v1-4",
      metrics: { auc: 0.791, asr: 0.448, tpr: 0.519 },
    },
    {
      job_id: "demo-job-004",
      status: "completed",
      contract_key: "pixel-art-v2",
      workspace_name: "demo-workspace",
      job_type: "gray-box",
      created_at: new Date(now - 7200000).toISOString(),
      updated_at: new Date(now - 6600000).toISOString(),
      target_model: "pixel-art-v2",
      metrics: { auc: 0.773, asr: 0.496, tpr: 0.689 },
    },
    {
      job_id: "demo-job-005",
      status: "failed",
      contract_key: "post-v2",
      workspace_name: "demo-workspace",
      job_type: "white-box",
      created_at: new Date(now - 10800000).toISOString(),
      updated_at: new Date(now - 10200000).toISOString(),
      target_model: "post-v2",
      error: "Model checkpoint not found",
    },
  ];

  if (mode === "active") {
    return demoJobs.filter((j) => j.status === "running" || j.status === "queued");
  }
  return demoJobs.filter((j) => j.status === "completed" || j.status === "failed" || j.status === "cancelled");
}

export function TaskListClient({ mode, locale }: TaskListClientProps) {
  const copy = WORKSPACE_COPY[locale].audits;
  const tableCopy = copy.taskTable;

  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);

  // Check demo mode from cookie - stable across renders
  const [demoMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.cookie.includes('platform-demo-mode=1');
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchJobs() {
      // Demo mode: use mock data
      if (demoMode) {
        setJobs(generateDemoJobs(mode));
        setError(null);
        setLoading(false);
        return;
      }

      // Production mode: fetch from API
      try {
        const res = await fetch("/api/v1/audit/jobs", {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          const allJobs: JobRecord[] = Array.isArray(data.jobs) ? data.jobs : [];
          const filtered =
            mode === "active"
              ? allJobs.filter((j) => j.status === "running" || j.status === "queued")
              : allJobs.filter((j) => j.status === "completed" || j.status === "failed" || j.status === "cancelled");
          setJobs(filtered);
          setError(null);
        } else {
          // API unavailable, show error
          setError(copy.taskTable.apiError || "API unavailable");
          setJobs([]);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          // API unavailable, show error
          setError(copy.taskTable.apiError || "API unavailable");
          setJobs([]);
        }
      } finally {
        setLoading(false);
      }
    }

    void fetchJobs();

    if (mode === "active") {
      const interval = setInterval(fetchJobs, 3000);
      return () => {
        controller.abort();
        clearInterval(interval);
      };
    }

    return () => controller.abort();
  }, [mode, demoMode]);

  async function handleRetry(job: JobRecord) {
    setRetryingJobId(job.job_id);
    try {
      await fetch("/api/v1/audit/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_key: job.contract_key,
          workspace_name: job.workspace_name,
          job_type: job.job_type,
        }),
      });
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

  if (error) {
    return (
      <div className="px-3 py-4 text-center">
        <div className="text-xs text-[color:var(--warning)] mb-2">{error}</div>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
          }}
          className="text-xs text-[color:var(--accent-blue)] hover:underline"
        >
          {copy.retry || "Retry"}
        </button>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="px-3 py-4 text-center">
        <div className="text-xs text-muted-foreground mb-3">
          {mode === "active" ? copy.emptyTasks : copy.emptyHistory}
        </div>
        <Link
          href="/workspace/audits/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[color:var(--accent-blue)] bg-[color:var(--accent-blue)]/10 rounded-md hover:bg-[color:var(--accent-blue)]/20 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M12 5v14m-7-7h14" />
          </svg>
          {mode === "active" ? copy.emptyTasksCta : copy.emptyHistoryCta}
        </Link>
      </div>
    );
  }

  // Active tasks: compact list with live pulse
  if (mode === "active") {
    return (
      <div className="divide-y divide-border">
        {jobs.map((job) => (
          <div key={job.job_id} className="px-3 py-2.5 transition-all duration-200 hover:bg-muted/30">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="mono text-xs font-medium truncate" title={job.job_id}>{job.job_id}</span>
              <StatusBadge tone={statusTone(job.status)} compact>{statusLabel(job.status, copy.statusLabels)}</StatusBadge>
            </div>
            <div className="mono text-xs text-muted-foreground mb-1 truncate" title={job.contract_key}>
              {job.contract_key}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate" title={job.workspace_name}>{job.workspace_name}</span>
              <span className="text-xs whitespace-nowrap ml-2">
                {formatDuration(job.created_at, job.updated_at)}
              </span>
            </div>
            {job.error && (
              <div className="mono mt-1.5 text-xs text-warning truncate">
                {job.error}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // History: full table view
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 bg-muted/30">
          <tr className="border-b border-border">
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{tableCopy.name}</th>
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{tableCopy.type}</th>
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{tableCopy.model}</th>
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{tableCopy.status}</th>
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{tableCopy.created}</th>
            <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">{tableCopy.duration}</th>
            <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">{tableCopy.action}</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, index) => (
            <tr
              key={job.job_id}
              className={`table-row-hover border-b border-border transition-all duration-200 hover:bg-muted/30 ${
                index % 2 === 0 ? "bg-background" : "bg-muted/10"
              }`}
            >
              <td className="px-3 py-2">
                <div className="font-medium text-xs" title={job.job_id}>{job.job_id}</div>
                <div className="mono text-xs text-muted-foreground mt-0.5" title={job.contract_key}>{job.contract_key}</div>
              </td>
              <td className="px-3 py-2">
                <span className="text-xs text-muted-foreground" title={job.job_type}>{job.job_type}</span>
              </td>
              <td className="px-3 py-2">
                <span className="mono text-xs">{job.target_model ?? "--"}</span>
              </td>
              <td className="px-3 py-2">
                <StatusBadge tone={statusTone(job.status)} compact>{statusLabel(job.status, copy.statusLabels)}</StatusBadge>
              </td>
              <td className="px-3 py-2">
                <span className="mono text-xs text-muted-foreground">{formatTime(job.created_at, locale)}</span>
              </td>
              <td className="mono px-3 py-2 text-right text-xs">
                {formatDuration(job.created_at, job.updated_at)}
              </td>
              <td className="px-3 py-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/workspace/audits/${job.job_id}`}
                    className="text-xs text-[var(--accent-blue)] hover:underline"
                  >
                    {tableCopy.action}
                  </Link>
                  {job.status === "failed" && (
                    <button
                      onClick={() => handleRetry(job)}
                      disabled={retryingJobId === job.job_id}
                      className="text-xs text-[var(--accent-amber)] hover:underline disabled:opacity-50"
                      title={copy.retryTitle}
                    >
                      {retryingJobId === job.job_id ? copy.retrying : copy.retry}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
