import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspace: string }> },
) {
  const { workspace } = await params;
  return proxyToBackend(`/api/v1/experiments/${workspace}/summary`);
}
