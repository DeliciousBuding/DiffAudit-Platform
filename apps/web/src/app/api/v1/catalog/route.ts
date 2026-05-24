import { proxyToBackend } from "@/lib/api-proxy";
import { authorizeApiV1Request } from "@/lib/api-route-auth";

export async function GET(request: Request) {
  const auth = await authorizeApiV1Request(request);
  if (!auth.ok) return auth.response;

  return proxyToBackend("/api/v1/catalog");
}
