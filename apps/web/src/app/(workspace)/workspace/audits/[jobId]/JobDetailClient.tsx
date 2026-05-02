"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Info } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/skeleton";
import { Modal } from "@/components/modal";
import { buildCompletedJobReportHref } from "@/lib/audit-flow";
import { formatFullTime, formatDuration, formatMetricValue } from "@/lib/format";
import { sanitizeRuntimeText } from "@/lib/runtime-text";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

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
  summary_note?: string | null;
  progress_pct?: number;
  metrics?: {
    auc?: number;
    asr?: number;
    tpr?: number;
  };
  error?: string | null;
  stdout_tail?: string | null;
  stderr_tail?: string | null;
  state_history?: Array<{
    state: string;
    timestamp: string;
  }>;
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

function JobMetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[13px] font-bold text-muted-foreground mb-1">{label}</div>
      <div className="mono text-lg font-semibold">{value}</div>
      <div className="mt-1 text-[13px] leading-4 text-muted-foreground">{note}</div>
    </div>
  );
}

function LogTail({ label, content, linesLabel }: { label: string; content: string; linesLabel: string }) {
  // Show only the last N lines to keep the UI manageable
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  const tail = lines.slice(-30);

  return (
    <div className="border border-border bg-card rounded-2xl overflow-hidden">
      <div className="border-b border-border bg-muted/20 px-4 py-2 flex items-center justify-between">
        <span className="mono text-[13px] font-bold text-muted-foreground">
          {label}
        </span>
        <span className="text-[13px] text-muted-foreground">{tail.length} {linesLabel}</span>
      </div>
      <pre className="mono text-[10px] leading-relaxed p-4 max-h-52 overflow-y-auto whitespace-pre-wrap break-all text-muted-foreground">
        {tail.join("\n")}
      </pre>
    </div>
  );
}

function StateHistory({
  entries,
  locale,
  labels,
  statusLabels,
}: {
  entries: Array<{ state: string; timestamp: string }>;
  locale: Locale;
  labels: {
    stateHistory: string;
    stateTimestamp: string;
    noStateHistory: string;
  };
  statusLabels: Record<string, string>;
}) {
  if (entries.length === 0) {
    return (
      <div className="text-[13px] text-muted-foreground text-center py-4">
        {labels.noStateHistory}
      </div>
    );
  }

  return (
    <div className="border border-border bg-card rounded-2xl overflow-hidden">
      <div className="border-b border-border bg-muted/20 px-4 py-2">
        <span className="text-[13px] font-bold text-muted-foreground">
          {labels.stateHistory}
        </span>
      </div>
      <div className="divide-y divide-border">
        {entries.map((entry, index) => (
          <div key={`${entry.state}-${entry.timestamp}-${index}`} className="flex items-center justify-between gap-4 px-4 py-2 text-[13px]">
            <div className="flex items-center gap-2">
              <StatusBadge tone={statusTone(entry.state)} compact>
                {statusLabel(entry.state, statusLabels)}
              </StatusBadge>
            </div>
            <div className="mono text-[13px] text-muted-foreground" title={`${labels.stateTimestamp}: ${entry.timestamp}`}>
              {formatFullTime(entry.timestamp, locale)}
            </div>
          </div>
        ))}
      </div>
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

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/audit/jobs/${jobId}`);
      if (!res.ok) {
        setFetchError(`${WORKSPACE_COPY[locale].jobDetail.labels.loadFailed} (HTTP ${res.status})`);
        return null;
      }
      const data = await res.json();
      const jobData: JobDetail = data.job ?? data;
      setJob(jobData);
      setFetchError(null);
      return jobData;
    } catch {
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
    let cancelled = false;

    async function loop() {
      if (cancelled) return;
      const current = await fetchJob();
      if (cancelled) return;
      if (current && (current.status === "queued" || current.status === "running")) {
        timerRef.current = setTimeout(loop, 3000);
      }
    }

    void loop();

    return () => {
      cancelled = true;
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
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
        <div className="text-[13px] text-warning">{fetchError ?? WORKSPACE_COPY[locale].jobDetail.labels.jobNotFound}</div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setFetchError(null);
              void fetchJob();
            }}
            className="workspace-btn-primary px-4 py-2 text-[13px] font-medium"
          >
            {copy.jobDetail.retry}
          </button>
          <Link
            href="/workspace/audits"
            className="inline-flex text-[13px] text-[var(--accent-blue)] hover:underline"
          >
            {WORKSPACE_COPY[locale].jobDetail.backToAudits}
          </Link>
        </div>
      </div>
    );
  }

  // Determine next-step suggestions — 7.2.2 (after null check)
  const isTerminal = ["completed", "failed", "cancelled"].includes(job.status);
  const suggestionsKey = job.status as keyof typeof copy.jobDetail.nextSteps;
  const suggestions = isTerminal ? copy.jobDetail.nextSteps[suggestionsKey] ?? [] : [];
  const reportHref = buildCompletedJobReportHref(job);
  const showMetrics = job.metrics && (
    typeof job.metrics.auc === "number"
    || typeof job.metrics.asr === "number"
    || typeof job.metrics.tpr === "number"
  );

  return (
    <div className="space-y-4">
      {/* Header: job ID + status badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="mono text-sm font-medium">{job.job_id}</span>
        <StatusBadge tone={statusTone(job.status)} compact>
          {statusLabel(job.status, copy.jobDetail.statusLabels)}
        </StatusBadge>
      </div>

      {job.summary_note && (
        <div className="rounded-2xl border border-[color:var(--accent-blue)]/25 bg-[color:var(--accent-blue)]/5 px-4 py-3 text-[13px] leading-6 text-foreground">
          {job.summary_note}
        </div>
      )}

      {reportHref ? (
        <div className="rounded-2xl border border-[color:var(--success)]/25 bg-[color:var(--success)]/10 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[13px] font-bold text-foreground">{copy.jobDetail.reportReadyTitle}</div>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{copy.jobDetail.reportReadyBody}</p>
            </div>
            <Link
              href={reportHref}
              className="workspace-btn-secondary px-3 py-1.5 text-[13px] font-medium"
            >
              {copy.jobDetail.viewReport}
            </Link>
          </div>
        </div>
      ) : null}

      {typeof job.progress_pct === "number" && !isTerminal && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[13px] font-bold text-muted-foreground">{copy.jobDetail.labels.executionProgress}</div>
            <div className="mono text-[13px] text-muted-foreground">{job.progress_pct}%</div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full bg-[var(--accent-blue)] transition-all"
              style={{ width: `${Math.max(8, Math.min(100, job.progress_pct))}%` }}
            />
          </div>
        </div>
      )}

      {showMetrics && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <JobMetricCard
            label="AUC"
            value={formatMetricValue(job.metrics?.auc)}
            note={copy.jobDetail.labels.metricAucNote}
          />
          <JobMetricCard
            label="ASR"
            value={formatMetricValue(job.metrics?.asr)}
            note={copy.jobDetail.labels.metricAsrNote}
          />
          <JobMetricCard
            label="TPR@1%FPR"
            value={formatMetricValue(job.metrics?.tpr)}
            note={copy.jobDetail.labels.metricTprNote}
          />
        </div>
      )}

      {/* Detail fields */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
          value={formatFullTime(job.created_at, locale)}
          mono
        />
        <DetailCard
          label={copy.jobDetail.labels.duration}
          value={formatDuration(job.created_at, job.updated_at, locale)}
          mono
        />
        {job.updated_at && (
          <DetailCard
            label={copy.jobDetail.labels.updated}
            value={formatFullTime(job.updated_at, locale)}
            mono
          />
        )}
      </div>

      {/* Error message */}
      {job.status === "failed" && job.error && (
        <div className="border border-[color:var(--warning-soft)] bg-[color:var(--warning-soft)]/20 rounded-2xl p-4">
          <div className="text-[13px] font-bold text-warning mb-1">
            {copy.jobDetail.labels.error}
          </div>
          <pre className="mono text-[10px] text-warning whitespace-pre-wrap break-all">
            {sanitizeRuntimeText(job.error)}
          </pre>
        </div>
      )}

      <StateHistory
        entries={job.state_history ?? []}
        locale={locale}
        labels={{
          stateHistory: copy.jobDetail.labels.stateHistory,
          stateTimestamp: copy.jobDetail.labels.stateTimestamp,
          noStateHistory: copy.jobDetail.labels.noStateHistory,
        }}
        statusLabels={copy.jobDetail.statusLabels}
      />

      {/* Stdout / Stderr tails */}
      <div className="space-y-3">
        {job.stdout_tail && (
          <LogTail label={copy.jobDetail.labels.stdoutTail} content={sanitizeRuntimeText(job.stdout_tail) ?? ""} linesLabel={copy.jobDetail.labels.lines} />
        )}
        {job.stderr_tail && (
          <LogTail label={copy.jobDetail.labels.stderrTail} content={sanitizeRuntimeText(job.stderr_tail) ?? ""} linesLabel={copy.jobDetail.labels.lines} />
        )}
        {!job.stdout_tail && !job.stderr_tail && (
          <div className="text-[13px] text-muted-foreground text-center py-4">
            {copy.jobDetail.labels.noLogOutput}
          </div>
        )}
      </div>

      {/* Suggested next steps — 7.2.2 */}
      {suggestions.length > 0 && (
        <div className="border border-[color:var(--accent-blue)]/30 bg-[color:var(--accent-blue)]/5 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <Info size={16} strokeWidth={1.5} className="shrink-0 text-[color:var(--accent-blue)] mt-0.5" />
            <div>
              <h3 className="text-[13px] font-bold text-[color:var(--accent-blue)] mb-1">
                {copy.jobDetail.nextStepsTitle}
              </h3>
              <ul className="space-y-1">
                {suggestions.map((s, i) => (
                  <li key={i} className="text-[13px] text-muted-foreground">{s}</li>
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
            className="workspace-btn-secondary px-4 py-2 text-[13px] font-medium disabled:opacity-50"
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
        closeLabel={copy.jobDetail.closeDialog}
        actions={
          <>
            <button
              onClick={() => setShowCancelModal(false)}
              disabled={cancelling}
              className="workspace-btn-secondary px-4 py-2 text-[13px]"
            >
              {copy.jobDetail.keepRunning}
            </button>
            <button
              onClick={handleCancelJob}
              disabled={cancelling}
              className="workspace-btn-primary px-4 py-2 text-[13px] font-medium disabled:opacity-50"
            >
              {cancelling ? copy.jobDetail.cancelling : copy.jobDetail.confirmCancel}
            </button>
          </>
        }
      >
        <p className="text-[13px] text-muted-foreground">
          {copy.jobDetail.cancelBody}
        </p>
        <p className="mt-2 mono text-[13px] text-muted-foreground">
          {copy.jobDetail.labels.jobIdLabel}: {job.job_id}
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
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[13px] font-bold text-muted-foreground mb-1">
        {label}
      </div>
      <div className={`text-[13px] truncate ${mono ? "mono" : ""}`}>{value}</div>
    </div>
  );
}
