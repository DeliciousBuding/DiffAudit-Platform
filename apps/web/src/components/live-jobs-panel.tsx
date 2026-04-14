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

export function LiveJobsPanel({ locale = "en-US" }: { locale?: Locale }) {
  const copy = WORKSPACE_COPY[locale].audits;
  const [state, setState] = useState<JobsState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

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
          setState({ kind: "ready", jobs: summarizeAuditJobs(payload as AuditJobPayload[]) });
        }
      } catch {
        if (!cancelled) {
          setState({ kind: "error" });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "loading") {
    return (
      <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground">
        {copy.jobsRefreshNote}
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground">
        {copy.jobsUnavailable}
      </div>
    );
  }

  if (state.jobs.length === 0) {
    return (
      <div className="rounded-[22px] border border-border bg-white/55 p-4 text-sm leading-7 text-muted-foreground">
        {copy.emptyJobs}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {state.jobs.map((job) => (
        <article
          key={job.jobId}
          className="rounded-[22px] border border-border bg-white/55 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-base font-medium">{job.jobId}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.workspaceName}
              </p>
            </div>
            <StatusBadge tone={job.statusTone}>{job.status}</StatusBadge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-[18px] border border-border bg-white/70 px-3 py-3 text-sm">
              {job.contractKey}
            </div>
            <div className="rounded-[18px] border border-border bg-white/70 px-3 py-3 text-sm">
              {copy.updatedAt} {job.updatedAtLabel}
            </div>
          </div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {job.error || job.summaryPath}
          </p>
        </article>
      ))}
    </div>
  );
}
