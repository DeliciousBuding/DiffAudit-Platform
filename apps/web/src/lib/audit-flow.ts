export type AuditReportTrack = "black-box" | "gray-box" | "white-box";

type AuditJobLike = {
  job_id?: string | null;
  status?: string | null;
  contract_key?: string | null;
  job_type?: string | null;
  target_model?: string | null;
  metrics?: {
    auc?: number | null;
  } | null;
};

export function inferReportTrack(job: Pick<AuditJobLike, "contract_key" | "job_type">): AuditReportTrack | null {
  const value = `${job.contract_key ?? ""} ${job.job_type ?? ""}`.toLowerCase();

  if (value.includes("black-box") || value.includes("recon")) {
    return "black-box";
  }
  if (value.includes("gray-box") || value.includes("pia")) {
    return "gray-box";
  }
  if (value.includes("white-box") || value.includes("gsa")) {
    return "white-box";
  }

  return null;
}

export function buildReportHref(track: AuditReportTrack, view: "display" | "audit" = "audit") {
  return `/workspace/reports/${track}?view=${view}`;
}

function appendSafeParam(params: URLSearchParams, key: string, value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return;
  }
  params.set(key, trimmed.slice(0, 120));
}

export function buildCompletedJobReportHref(job: AuditJobLike) {
  if (job.status !== "completed") {
    return null;
  }

  const track = inferReportTrack(job);
  if (!track) {
    return null;
  }

  const params = new URLSearchParams({ view: "audit" });
  appendSafeParam(params, "job", job.job_id);
  appendSafeParam(params, "contract", job.contract_key);
  appendSafeParam(params, "model", job.target_model);
  if (typeof job.metrics?.auc === "number") {
    params.set("auc", job.metrics.auc.toFixed(3));
  }

  return `/workspace/reports/${track}?${params.toString()}`;
}
