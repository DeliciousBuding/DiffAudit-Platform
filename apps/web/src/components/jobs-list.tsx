"use client";

import { useEffect, useState } from "react";

import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

type AuditJobPayload = {
  job_id?: string | null;
  status?: string | null;
  contract_key?: string | null;
  workspace_name?: string | null;
  updated_at?: string | null;
  summary_path?: string | null;
  error?: string | null;
};

type AuditJobViewModel = {
  jobId: string;
  status: string;
  statusTone: "primary" | "success" | "warning" | "info";
  contractKey: string;
  workspaceName: string;
  updatedAtLabel: string;
  summaryPath: string;
  error: string;
};

type JobsState =
  | { kind: "loading" }
  | { kind: "ready"; jobs: AuditJobViewModel[] }
  | { kind: "error" };

function statusTone(status: string): AuditJobViewModel["statusTone"] {
  if (status === "completed") {
    return "success";
  }
  if (status === "failed") {
    return "warning";
  }
  if (status === "running") {
    return "info";
  }
  return "primary";
}

function formatUpdatedAt(value: string | null | undefined) {
  if (!value) {
    return "刚刚更新";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Hong_Kong",
  }).format(date);
}

function summarizeAuditJobs(jobs: AuditJobPayload[]): AuditJobViewModel[] {
  const normalized = jobs
    .flatMap((job) => {
      if (
        typeof job?.job_id !== "string" ||
        typeof job?.status !== "string" ||
        typeof job?.contract_key !== "string"
      ) {
        return [];
      }

      return [{
        job_id: job.job_id,
        status: job.status,
        contract_key: job.contract_key,
        workspace_name: job.workspace_name ?? null,
        updated_at: job.updated_at ?? null,
        summary_path: job.summary_path ?? null,
        error: job.error ?? null,
      }];
    })
    .sort((left, right) => {
      const leftTime = left.updated_at ? new Date(left.updated_at).getTime() : 0;
      const rightTime = right.updated_at ? new Date(right.updated_at).getTime() : 0;
      return rightTime - leftTime;
    })
    .map((job) => ({
      jobId: job.job_id,
      status: job.status,
      statusTone: statusTone(job.status),
      contractKey: job.contract_key,
      workspaceName: job.workspace_name ?? "pending workspace",
      updatedAtLabel: formatUpdatedAt(job.updated_at),
      summaryPath: job.summary_path ?? "运行完成后会显示 summary 路径。",
      error: job.error ?? "",
    }));

  return normalized;
}

export function JobsList({ locale = "en-US" }: { locale?: Locale }) {
  const copy = WORKSPACE_COPY[locale].audits;
  const [state, setState] = useState<JobsState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const load = async () => {
      try {
        const response = await fetch("/api/v1/audit/jobs", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`jobs request failed: ${response.status}`);
        }

        const payload = await response.json();
        if (!Array.isArray(payload)) {
          throw new Error("jobs payload is not an array");
        }

        if (!cancelled) {
          const jobs = summarizeAuditJobs(payload as AuditJobPayload[]);
          setState({ kind: "ready", jobs });

          // Auto-stop polling when all jobs are completed or failed
          if (intervalId && jobs.length > 0 && jobs.every((j) => j.status === "completed" || j.status === "failed")) {
            clearInterval(intervalId);
            intervalId = undefined;
          }
        }
      } catch {
        if (!cancelled) {
          setState({ kind: "error" });
        }
      }
    };

    void load();
    intervalId = setInterval(() => { void load(); }, 3000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (state.kind === "loading") {
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground text-center">
        {copy.jobsRefreshNote}
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="px-3 py-4 text-xs text-warning text-center">
        {copy.jobsUnavailable}
      </div>
    );
  }

  if (state.jobs.length === 0) {
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground text-center">
        {copy.emptyJobs}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {state.jobs.map((job) => (
        <div
          key={job.jobId}
          className="px-3 py-2 transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="mono text-xs font-medium truncate">{job.jobId}</span>
            <StatusBadge tone={job.statusTone}>{job.status}</StatusBadge>
          </div>
          <div className="text-xs text-muted-foreground mb-1 truncate">
            {job.contractKey}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{job.workspaceName}</span>
            <span className="text-[10px] whitespace-nowrap ml-2">{job.updatedAtLabel}</span>
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
