import { proxyToBackend } from "@/lib/api-proxy";
import { isDemoModeEnabledServer } from "@/lib/demo-mode";
import { createDemoJob, listDemoJobs } from "@/lib/demo-jobs-store";

export async function GET(request: Request) {
  if (await isDemoModeEnabledServer(request)) {
    return Response.json({ jobs: listDemoJobs() });
  }
  return proxyToBackend("/api/v1/audit/jobs");
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
    return Response.json({ ok: true, job }, { status: 201 });
  }

  return proxyToBackend("/api/v1/audit/jobs", {
    method: "POST",
    body: await request.text(),
  });
}
