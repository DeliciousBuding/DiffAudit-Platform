import { proxyToBackend } from "@/lib/api-proxy";

const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_-]+$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspace: string }> },
) {
  const { workspace } = await params;
  if (!SAFE_PATH_SEGMENT.test(workspace)) {
    return Response.json({ detail: "Invalid workspace parameter." }, { status: 400 });
  }
  return proxyToBackend(`/api/v1/experiments/${workspace}/summary`);
}
