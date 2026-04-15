"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";

import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/skeleton";
import { Modal } from "@/components/modal";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { getStatusTone } from "@/lib/status-utils";
import { getErrorMessage } from "@/lib/error-messages";

// Extended job record — the detail API may return stdout/stderr tails
interface JobDetail {
  job_id: string;
  status: string;
  contract_key: string;
  workspace_name: string;
  job_type: string;
  created_at: string;
  updated_at: string | null;
  target_model?: string | null;
  error?: string | null;
  stdout_tail?: string | null;
  stderr_tail?: string | null;
}

function statusLabel(status: string, labels: Record<string, string>): string {
  return labels[status] ?? status;
}

function formatTime(iso: string, locale: Locale): string {
  try {
    const tag = locale === "zh-CN" ? "zh-CN" : "en-US";
    return new Date(iso).toLocaleString(tag, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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

function LogTail({ label, content, linesLabel }: { label: string; content: string; linesLabel: string }) {
  // Show only the last N lines to keep the UI manageable
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  const tail = lines.slice(-30);

  return (
    <div className="border border-border bg-card rounded-md overflow-hidden">
      <div className="border-b border-border bg-muted/20 px-3 py-1.5 flex items-center justify-between">
        <span className="mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{tail.length} {linesLabel}</span>
      </div>
      <pre className="mono text-xs leading-relaxed p-3 max-h-52 overflow-y-auto whitespace-pre-wrap break-all text-muted-foreground">
        {tail.join("\n")}
      </pre>
    </div>
  );
}

export function JobDetailClient({
  jobId,
  locale,
}: {
  jobId: string;
  locale: Locale;
}) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchJob = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`/api/v1/audit/jobs/${jobId}`, { signal });
      if (!res.ok) {
        const errorMsg = getErrorMessage(res.status, locale);
        setFetchError(`${WORKSPACE_COPY[locale].jobDetail.labels.loadFailed}: ${errorMsg}`);
        return null;
      }
      const data = await res.json();
      const jobData: JobDetail = data.job ?? data;
      setJob(jobData);
      setFetchError(null);
      return jobData;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null;
      }
      setFetchError(WORKSPACE_COPY[locale].jobDetail.labels.apiUnreachable);
      return null;
    } finally {
      setLoading(false);
    }
  }, [jobId, locale]);

  const handleCancelJob = useCallback(async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/v1/audit/jobs/${jobId}`, { method: "DELETE" });
      if (res.ok) {
        setJob((prev) => (prev ? { ...prev, status: "cancelled" } : null));
      }
    } catch {
      // Ignore — polling will reflect the real state eventually
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  }, [jobId]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loop() {
      const current = await fetchJob(controller.signal);
      if (controller.signal.aborted) return;
      if (current && (current.status === "queued" || current.status === "running")) {
        timerRef.current = setTimeout(loop, 3000);
      }
    }

    void loop();

    return () => {
      controller.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchJob]);

  const copy = WORKSPACE_COPY[locale];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-3 w-32" />
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError || !job) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-warning">{fetchError ?? WORKSPACE_COPY[locale].jobDetail.labels.jobNotFound}</div>
        <Link
          href="/workspace/audits"
          className="inline-flex text-xs text-[var(--accent-blue)] hover:underline"
        >
          {WORKSPACE_COPY[locale].jobDetail.backToAudits}
        </Link>
      </div>
    );
  }

  // Determine next-step suggestions — 7.2.2 (after null check)
  const isTerminal = ["completed", "failed", "cancelled"].includes(job.status);
  const suggestionsKey = job.status as keyof typeof copy.jobDetail.nextSteps;
  const suggestions = isTerminal ? copy.jobDetail.nextSteps[suggestionsKey] ?? [] : [];

  return (
    <div className="space-y-4">
      {/* Back link */}
      <Link
        href="/workspace/audits"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {copy.jobDetail.backToAudits}
      </Link>

      {/* Header: job ID + status badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="mono text-sm font-medium">{job.job_id}</span>
        <StatusBadge tone={getStatusTone(job.status as any)} compact>
          {statusLabel(job.status, copy.jobDetail.statusLabels)}
        </StatusBadge>
        {(job.status === "queued" || job.status === "running") && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium text-[color:var(--accent-blue)] bg-[color:var(--accent-blue)]/10 rounded-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--accent-blue)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--accent-blue)]"></span>
            </span>
            LIVE
          </span>
        )}
      </div>

      {/* Detail fields */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <DetailCard label={copy.jobDetail.labels.contractKey} value={job.contract_key} mono />
        <DetailCard label={copy.jobDetail.labels.workspace} value={job.workspace_name} />
        <DetailCard label={copy.jobDetail.labels.type} value={job.job_type} mono />
        <DetailCard
          label={copy.jobDetail.labels.targetModel}
          value={job.target_model ?? "--"}
          mono
        />
        <DetailCard
          label={copy.jobDetail.labels.created}
          value={formatTime(job.created_at, locale)}
          mono
        />
        <DetailCard
          label={copy.jobDetail.labels.duration}
          value={formatDuration(job.created_at, job.updated_at)}
          mono
        />
        {job.updated_at && (
          <DetailCard
            label={copy.jobDetail.labels.updated}
            value={formatTime(job.updated_at, locale)}
            mono
          />
        )}
      </div>

      {/* Error message */}
      {job.status === "failed" && job.error && (
        <div className="border border-[color:var(--warning-soft)] bg-[color:var(--warning-soft)]/20 rounded-md p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-warning mb-1">
            {copy.jobDetail.labels.error}
          </div>
          <pre className="mono text-xs text-warning whitespace-pre-wrap break-all">
            {job.error}
          </pre>
        </div>
      )}

      {/* Stdout / Stderr tails */}
      <div className="space-y-3">
        {job.stdout_tail && (
          <LogTail label={copy.jobDetail.labels.stdoutTail} content={job.stdout_tail} linesLabel={copy.jobDetail.labels.lines} />
        )}
        {job.stderr_tail && (
          <LogTail label={copy.jobDetail.labels.stderrTail} content={job.stderr_tail} linesLabel={copy.jobDetail.labels.lines} />
        )}
        {!job.stdout_tail && !job.stderr_tail && (
          <div className="text-xs text-muted-foreground text-center py-4">
            {copy.jobDetail.labels.noLogOutput}
          </div>
        )}
      </div>

      {/* Suggested next steps — 7.2.2 */}
      {suggestions.length > 0 && (
        <div className="border border-[color:var(--accent-blue)]/30 bg-[color:var(--accent-blue)]/5 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[color:var(--accent-blue)] mt-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-blue)] mb-1">
                {copy.jobDetail.nextStepsTitle}
              </h3>
              <ul className="space-y-1">
                {suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cancel button for running/queued jobs */}
      {(job.status === "running" || job.status === "queued") && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={cancelling}
            className="rounded-md border border-[color:var(--warning-soft)] bg-[color:var(--warning-soft)]/20 px-4 py-2 text-sm font-medium text-[color:var(--warning)] hover:bg-[color:var(--warning-soft)]/30 disabled:opacity-50 transition-colors"
          >
            {cancelling ? copy.jobDetail.cancelling : copy.jobDetail.cancelJob}
          </button>
        </div>
      )}

      {/* Cancel confirmation modal */}
      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={copy.jobDetail.cancelTitle}
        actions={
          <>
            <button
              onClick={() => setShowCancelModal(false)}
              disabled={cancelling}
              className="rounded-md px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              {copy.jobDetail.keepRunning}
            </button>
            <button
              onClick={handleCancelJob}
              disabled={cancelling}
              className="rounded-md bg-[color:var(--warning)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {cancelling ? copy.jobDetail.cancelling : copy.jobDetail.confirmCancel}
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          {copy.jobDetail.cancelBody}
        </p>
        <p className="mt-2 mono text-xs text-[var(--color-text-muted)]">
          Job: {job.job_id}
        </p>
      </Modal>
    </div>
  );
}

function DetailCard({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <div className={`text-sm truncate ${mono ? "mono" : ""}`}>{value}</div>
    </div>
  );
}
