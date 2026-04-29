export type AuditReportTrack = "black-box" | "gray-box" | "white-box";

type AuditJobLike = {
  status?: string | null;
  contract_key?: string | null;
  job_type?: string | null;
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

export function buildCompletedJobReportHref(job: AuditJobLike) {
  if (job.status !== "completed") {
    return null;
  }

  const track = inferReportTrack(job);
  return track ? buildReportHref(track, "audit") : null;
}
