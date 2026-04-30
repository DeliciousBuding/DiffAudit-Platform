import { backendBaseUrl } from "@/lib/api-proxy";
import { fetchWithTimeout } from "@/lib/fetch-timeout";
import { normalizeAuditJobList } from "@/lib/audit-job-payload";
import { sanitizeRuntimeText } from "@/lib/runtime-text";

const DEFAULT_SERVER_FETCH_TIMEOUT_MS = 600;

export type AuditJobPayload = {
  job_id?: string | null;
  status?: string | null;
  contract_key?: string | null;
  workspace_name?: string | null;
  updated_at?: string | null;
  summary_path?: string | null;
  error?: string | null;
};

export type AuditJobViewModel = {
  jobId: string;
  status: string;
  statusTone: "primary" | "success" | "warning" | "info";
  contractKey: string;
  workspaceName: string;
  updatedAtLabel: string;
  summaryPath: string;
  error: string;
};

function normalizeAuditJob(job: unknown): AuditJobPayload | null {
  if (!job || typeof job !== "object") {
    return null;
  }

  const candidate = job as Record<string, unknown>;
  if (
    typeof candidate.job_id !== "string" ||
    typeof candidate.status !== "string" ||
    typeof candidate.contract_key !== "string"
  ) {
    return null;
  }

  return {
    job_id: candidate.job_id,
    status: candidate.status,
    contract_key: candidate.contract_key,
    workspace_name:
      typeof candidate.workspace_name === "string" ? candidate.workspace_name : null,
    updated_at: typeof candidate.updated_at === "string" ? candidate.updated_at : null,
    summary_path: typeof candidate.summary_path === "string" ? candidate.summary_path : null,
    error: typeof candidate.error === "string" ? candidate.error : null,
  };
}

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
    return "just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function summarizeAuditJobs(jobs: AuditJobPayload[]): AuditJobViewModel[] {
  return jobs
    .map((job) => normalizeAuditJob(job))
    .filter((job): job is AuditJobPayload => job !== null)
    .sort((left, right) => {
      const leftTime = left.updated_at ? new Date(left.updated_at).getTime() : 0;
      const rightTime = right.updated_at ? new Date(right.updated_at).getTime() : 0;
      return rightTime - leftTime;
    })
    .map((job) => ({
      jobId: job.job_id ?? "unknown-job",
      status: job.status ?? "unknown",
      statusTone: statusTone(job.status ?? "unknown"),
      contractKey: job.contract_key ?? "unknown contract",
      workspaceName: job.workspace_name ?? "pending workspace",
      updatedAtLabel: formatUpdatedAt(job.updated_at),
      summaryPath: sanitizeRuntimeText(job.summary_path) ?? "Summary path will appear after the run completes.",
      error: sanitizeRuntimeText(job.error) ?? "",
    }));
}

export async function fetchAuditJobs(): Promise<AuditJobViewModel[] | null> {
  const url = new URL("/api/v1/audit/jobs", backendBaseUrl());

  try {
    const response = await fetchWithTimeout(
      url,
      { cache: "no-store" },
      { timeoutMs: DEFAULT_SERVER_FETCH_TIMEOUT_MS },
    );
    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const jobs = normalizeAuditJobList<AuditJobPayload>(payload);
    return jobs ? summarizeAuditJobs(jobs) : null;
  } catch {
    return null;
  }
}
