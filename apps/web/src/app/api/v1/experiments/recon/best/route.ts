import { proxyToBackend } from "@/lib/api-proxy";

export async function GET() {
  return proxyToBackend("/api/v1/experiments/recon/best");
}
