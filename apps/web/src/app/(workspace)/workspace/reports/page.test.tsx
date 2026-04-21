import { renderToReadableStream } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

async function renderMarkup(element: React.ReactNode) {
  const stream = await renderToReadableStream(element);
  await stream.allReady;
  return await new Response(stream).text();
}

describe("WorkspaceReportsPage", () => {
  afterEach(() => {
    headersMock.mockReset();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("renders zh-CN copy with backend data", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

      if (url.includes("/api/v1/catalog")) {
        return new Response(
          JSON.stringify([
            {
              contract_key: "black-box/recon/sd15-ddim",
              track: "black-box",
              attack_family: "recon",
              target_key: "sd15-ddim",
              label: "Stable Diffusion 1.5 DDIM Recon",
              availability: "ready",
              evidence_level: "best-summary",
              best_workspace: "recon-runtime-mainline-ddim-public-100-step30",
              system_gap: "surface semantic limits cleanly",
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (url.includes("/api/v1/evidence/attack-defense-table")) {
        return new Response(
          JSON.stringify({
            rows: [
              {
                track: "black-box",
                attack: "recon DDIM public-100 step30",
                defense: "none",
                model: "Stable Diffusion v1.5 + DDIM",
                auc: 0.849,
                asr: 0.51,
                tpr_at_1pct_fpr: 1,
                quality_cost: "100 public samples per split",
                evidence_level: "runtime-mainline",
                note: "current black-box main evidence",
                boundary: "controlled / public-subset / proxy-shadow-member / risk-exists",
                source: "experiments/recon-runtime-mainline-ddim-public-100-step30/summary.json",
                provenance_status: "workspace-verified",
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "zh-CN"]]));
    const { default: WorkspaceReportsPage } = await import("./page");
    const markup = await renderMarkup(await WorkspaceReportsPage());

    expect(markup).toContain("审计结果和覆盖缺口。");
    expect(markup).toContain("这里汇总了所有审计结果，帮你发现模型防御的薄弱环节。");
    expect(markup).toContain("审计结果");
    expect(markup).toContain("覆盖缺口");
    expect(markup).toContain("recon DDIM public-100 step30");
    expect(markup).toContain("证据边界");
    expect(markup).toContain("来源路径");
    expect(markup).toContain("workspace-verified");
    expect(markup).toContain("导出报告");
  });

  it("renders en-US empty states when backend data is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")));

    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "en-US"]]));
    const { default: WorkspaceReportsPage } = await import("./page");
    const markup = await renderMarkup(await WorkspaceReportsPage());

    expect(markup).toContain("Audit results and coverage gaps.");
    expect(markup).toContain("Aggregate audit results and identify weak spots in your model&#x27;s defenses.");
    expect(markup).toContain("No audit results yet.");
    expect(markup).toContain("No coverage gap data.");
    expect(markup).toContain("Export report");
  });
});
