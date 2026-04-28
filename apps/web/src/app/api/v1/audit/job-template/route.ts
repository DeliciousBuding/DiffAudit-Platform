import { isDemoModeEnabledServer } from "@/lib/demo-mode";
import { proxyToBackend } from "@/lib/api-proxy";

function inferDemoJobType(contractKey: string) {
  const normalized = contractKey.toLowerCase();
  if (normalized.includes("gsa") || normalized.includes("white")) {
    return "gsa_runtime_mainline";
  }
  if (normalized.includes("pia") || normalized.includes("gray")) {
    return "pia_runtime_mainline";
  }
  return "recon_artifact_mainline";
}

export async function GET(request: Request) {
  const contractKey = new URL(request.url).searchParams.get("contract_key") ?? "recon_artifact_mainline";

  if (await isDemoModeEnabledServer(request)) {
    return Response.json({
      job_type: inferDemoJobType(contractKey),
      contract_key: contractKey,
      workspace_name:
        `demo-${contractKey.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "workspace"}`,
      runtime_profile: "demo",
      assets: {},
      job_inputs: {
        rounds: 10,
        batch_size: 32,
        adaptive_sampling: true,
      },
      demo_mode: true,
    });
  }

  const path = `/api/v1/audit/job-template?contract_key=${encodeURIComponent(contractKey)}`;
  return proxyToBackend(path);
}
