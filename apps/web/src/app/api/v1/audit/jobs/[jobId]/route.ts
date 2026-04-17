import { cookies } from "next/headers";

import { proxyToBackend } from "@/lib/api-proxy";
import { DEMO_MODE_COOKIE } from "@/lib/demo-mode-constants";
import { cancelDemoJob, findDemoJob } from "@/lib/demo-jobs-store";

async function isDemoRequest(request?: Request) {
  const headerCookie = request?.headers.get("cookie");
  if (headerCookie) {
    return headerCookie.includes(`${DEMO_MODE_COOKIE}=1`);
  }
  try {
    const cookieStore = await cookies();
    return cookieStore.get(DEMO_MODE_COOKIE)?.value === "1";
  } catch {
    return false;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  if (await isDemoRequest(request)) {
    const job = findDemoJob(jobId);
    return job
      ? Response.json({ job })
      : Response.json({ detail: "Demo job not found" }, { status: 404 });
  }
  return proxyToBackend(`/api/v1/audit/jobs/${jobId}`);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  if (await isDemoRequest(request)) {
    const job = cancelDemoJob(jobId);
    return job
      ? Response.json({ ok: true, job })
      : Response.json({ detail: "Demo job not found" }, { status: 404 });
  }
  return proxyToBackend(`/api/v1/audit/jobs/${jobId}`, { method: "DELETE" });
}
