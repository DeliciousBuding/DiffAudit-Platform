import { proxyJsonToBackend } from "@/lib/api-proxy";
import { authorizeApiV1Request } from "@/lib/api-route-auth";
import { sanitizeAuditJobPayload } from "@/lib/audit-job-payload";
import { cancelDemoJob, findDemoJob } from "@/lib/demo-jobs-store";
import { isValidPathSegment } from "@/lib/path-validation";

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  if (!isValidPathSegment(jobId)) {
    return Response.json({ detail: "Invalid job ID." }, { status: 400 });
  }
  const auth = await authorizeApiV1Request(request);
  if (!auth.ok) return auth.response;

  if (auth.demoMode) {
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
  if (!isValidPathSegment(jobId)) {
    return Response.json({ detail: "Invalid job ID." }, { status: 400 });
  }
  const auth = await authorizeApiV1Request(request);
  if (!auth.ok) return auth.response;

  if (auth.demoMode) {
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
