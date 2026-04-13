import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(request: Request) {
  const path = `/api/v1/audit/job-template${new URL(request.url).search}`;
  return proxyToBackend(path);
}
