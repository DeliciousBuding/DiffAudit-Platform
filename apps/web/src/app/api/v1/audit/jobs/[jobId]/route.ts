import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  return proxyToBackend(`/api/v1/audit/jobs/${jobId}`);
}
