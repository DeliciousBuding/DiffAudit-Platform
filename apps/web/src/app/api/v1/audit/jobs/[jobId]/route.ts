import { proxyJsonToBackend } from "@/lib/api-proxy";
import { sanitizeAuditJobPayload } from "@/lib/audit-job-payload";
import { isDemoModeEnabledServer } from "@/lib/demo-mode";
import { cancelDemoJob, findDemoJob } from "@/lib/demo-jobs-store";

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  if (await isDemoModeEnabledServer(request)) {
    const job = findDemoJob(jobId);
    return job
      ? Response.json(sanitizeAuditJobPayload({ job }))
      : Response.json({ detail: "Demo job not found" }, { status: 404 });
  }
  return proxyJsonToBackend(
    `/api/v1/audit/jobs/${jobId}`,
    undefined,
    sanitizeAuditJobPayload,
  );
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  if (await isDemoModeEnabledServer(request)) {
    const job = cancelDemoJob(jobId);
    return job
      ? Response.json(sanitizeAuditJobPayload({ ok: true, job }))
      : Response.json({ detail: "Demo job not found" }, { status: 404 });
  }
  return proxyJsonToBackend(
    `/api/v1/audit/jobs/${jobId}`,
    { method: "DELETE" },
    sanitizeAuditJobPayload,
  );
}
