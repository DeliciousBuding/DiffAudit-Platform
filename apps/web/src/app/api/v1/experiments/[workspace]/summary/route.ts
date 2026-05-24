import { proxyToBackend } from "@/lib/api-proxy";
import { authorizeApiV1Request } from "@/lib/api-route-auth";
import { isValidWorkspaceIdentifier } from "@/lib/path-validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspace: string }> },
) {
  const { workspace } = await params;
  if (!isValidWorkspaceIdentifier(workspace)) {
    return Response.json({ detail: "Invalid workspace parameter." }, { status: 400 });
  }
  const auth = await authorizeApiV1Request(request);
  if (!auth.ok) return auth.response;

  return proxyToBackend(`/api/v1/experiments/${encodeURIComponent(workspace)}/summary`);
}
