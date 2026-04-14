import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import WorkspaceReportsPage from "./page";

describe("WorkspaceReportsPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders zh-CN copy with backend data", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
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
        ),
      )
      .mockResolvedValueOnce(
        new Response(
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
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    const markup = renderToStaticMarkup(await WorkspaceReportsPage({ locale: "zh-CN" }));

    expect(markup).toContain("结果汇总、覆盖缺口与报告导出。");
    expect(markup).toContain("审计结果");
    expect(markup).toContain("覆盖缺口");
    expect(markup).toContain("recon DDIM public-100 step30");
    expect(markup).toContain("surface semantic limits cleanly");
    expect(markup).toContain("导出报告摘要");
  });

  it("renders en-US empty states when backend data is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")));

    const markup = renderToStaticMarkup(await WorkspaceReportsPage({ locale: "en-US" }));

    expect(markup).toContain("Result summaries, coverage gaps, and report exports.");
    expect(markup).toContain("No audit results yet.");
    expect(markup).toContain("No coverage gap data.");
    expect(markup).toContain("Export report summary");
  });
});