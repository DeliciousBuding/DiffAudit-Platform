import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(
  _request: Request,
  context: { params: Promise<{ workspace: string }> },
) {
  const { workspace } = await context.params;
  return proxyToBackend(`/api/v1/experiments/${workspace}/summary`);
}
