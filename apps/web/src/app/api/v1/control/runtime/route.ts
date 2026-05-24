import { isDemoModeEnabledServer, isDemoModeForcedServer } from "@/lib/demo-mode";
import { proxyToBackend } from "@/lib/api-proxy";
import { authorizeApiV1Request } from "@/lib/api-route-auth";

export async function GET(request: Request) {
  if (await isDemoModeEnabledServer(request)) {
    return Response.json({
      connected: true,
      demo_mode: true,
      forced: isDemoModeForcedServer(),
      detail: "demo snapshot mode",
    });
  }

  const auth = await authorizeApiV1Request(request);
  if (!auth.ok) return auth.response;

  return proxyToBackend("/api/v1/control/runtime");
}
