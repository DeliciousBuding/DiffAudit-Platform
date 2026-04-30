import { proxyToBackend } from "@/lib/api-proxy";
import { isValidWorkspaceIdentifier } from "@/lib/path-validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspace: string }> },
) {
  const { workspace } = await params;
  if (!isValidWorkspaceIdentifier(workspace)) {
    return Response.json({ detail: "Invalid workspace parameter." }, { status: 400 });
  }
  return proxyToBackend(`/api/v1/experiments/${encodeURIComponent(workspace)}/summary`);
}
