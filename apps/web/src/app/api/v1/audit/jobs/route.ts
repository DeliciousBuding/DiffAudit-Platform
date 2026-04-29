import { proxyJsonToBackend } from "@/lib/api-proxy";
import { sanitizeAuditJobPayload } from "@/lib/audit-job-payload";
import { isDemoModeEnabledServer } from "@/lib/demo-mode";
import { createDemoJob, listDemoJobs } from "@/lib/demo-jobs-store";

export async function GET(request: Request) {
  if (await isDemoModeEnabledServer(request)) {
    return Response.json(sanitizeAuditJobPayload({ jobs: listDemoJobs() }));
  }
  return proxyJsonToBackend(
    "/api/v1/audit/jobs",
    undefined,
    sanitizeAuditJobPayload,
  );
}

export async function POST(request: Request) {
  if (await isDemoModeEnabledServer(request)) {
    const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const job = createDemoJob({
      contract_key: typeof payload?.contract_key === "string" ? payload.contract_key : undefined,
      workspace_name: typeof payload?.workspace_name === "string" ? payload.workspace_name : undefined,
      job_type: typeof payload?.job_type === "string" ? payload.job_type : undefined,
      target_model:
        typeof payload?.target_model === "string"
          ? payload.target_model
          : typeof payload?.contract_key === "string"
            ? payload.contract_key
            : undefined,
    });
    return Response.json(sanitizeAuditJobPayload({ ok: true, job }), { status: 201 });
  }

  return proxyJsonToBackend(
    "/api/v1/audit/jobs",
    {
      method: "POST",
      body: await request.text(),
    },
    sanitizeAuditJobPayload,
  );
}
