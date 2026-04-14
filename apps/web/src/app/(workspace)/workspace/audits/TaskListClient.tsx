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

function statusLabel(status: string): string {
  switch (status) {
    case "queued": return "Queued";
    case "running": return "Running";
    case "completed": return "Completed";
    case "failed": return "Failed";
    case "cancelled": return "Cancelled";
    default: return status;
  }
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

export function TaskListClient({ mode, locale }: TaskListClientProps) {
  const copy = WORKSPACE_COPY[locale].audits;
  const tableCopy = copy.taskTable;

  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchJobs() {
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
        }
      } catch {
        // Ignore fetch errors (abort, network)
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
  }, [mode]);

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

  if (jobs.length === 0) {
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground text-center">
        {mode === "active" ? copy.emptyTasks : copy.emptyHistory}
      </div>
    );
  }

  // Active tasks: compact list with live pulse
  if (mode === "active") {
    return (
      <div className="divide-y divide-border">
        {jobs.map((job) => (
          <div key={job.job_id} className="px-3 py-2.5 transition-colors hover:bg-muted/30">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="mono text-xs font-medium truncate">{job.job_id}</span>
              <StatusBadge tone={statusTone(job.status)} compact>{statusLabel(job.status)}</StatusBadge>
            </div>
            <div className="mono text-[10px] text-muted-foreground mb-1 truncate">
              {job.contract_key}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate">{job.workspace_name}</span>
              <span className="text-[10px] whitespace-nowrap ml-2">
                {formatDuration(job.created_at, job.updated_at)}
              </span>
            </div>
            {job.error && (
              <div className="mono mt-1.5 text-[10px] text-warning truncate">
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
              className={`table-row-hover border-b border-border transition-colors hover:bg-muted/30 ${
                index % 2 === 0 ? "bg-background" : "bg-muted/10"
              }`}
            >
              <td className="px-3 py-2">
                <div className="font-medium text-xs">{job.job_id}</div>
                <div className="mono text-[10px] text-muted-foreground mt-0.5">{job.contract_key}</div>
              </td>
              <td className="px-3 py-2">
                <span className="text-xs text-muted-foreground">{job.job_type}</span>
              </td>
              <td className="px-3 py-2">
                <span className="mono text-xs">{job.target_model ?? "--"}</span>
              </td>
              <td className="px-3 py-2">
                <StatusBadge tone={statusTone(job.status)} compact>{statusLabel(job.status)}</StatusBadge>
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
                      title="Retry this job"
                    >
                      {retryingJobId === job.job_id ? "Retrying..." : "Retry"}
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
