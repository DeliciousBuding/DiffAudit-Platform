import { proxyToBackend } from "@/lib/api-proxy";

export async function GET() {
  return proxyToBackend("/api/v1/audit/jobs");
}

export async function POST(request: Request) {
  return proxyToBackend("/api/v1/audit/jobs", {
    method: "POST",
    body: await request.text(),
  });
}
