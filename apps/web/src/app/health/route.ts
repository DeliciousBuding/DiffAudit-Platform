import { proxyToBackend } from "@/lib/api-proxy";
import { isDemoModeEnabledServer } from "@/lib/demo-mode";

export async function GET(request: Request) {
  if (await isDemoModeEnabledServer(request)) {
    return Response.json({
      demo_mode: true,
      snapshot_available: true,
      build: {
        revision: "demo-snapshot",
      },
    });
  }

  return proxyToBackend("/health");
}
