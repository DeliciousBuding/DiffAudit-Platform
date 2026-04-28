import { isDemoModeEnabledServer, isDemoModeForcedServer } from "@/lib/demo-mode";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(request: Request) {
  if (await isDemoModeEnabledServer(request)) {
    return Response.json({
      connected: true,
      demo_mode: true,
      forced: isDemoModeForcedServer(),
      detail: "demo snapshot mode",
    });
  }
  return proxyToBackend("/api/v1/control/runtime");
}
