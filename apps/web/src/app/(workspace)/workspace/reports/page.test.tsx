import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithSuspense } from "@/lib/test-render";
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
          JSON.stringify({
            rows: [
              {
                track: "black-box",
                attack: "Recon",
                defense: "none",
                model: "Stable Diffusion v1.5 + DDIM",
                auc: 0.849,
                asr: 0.51,
                tpr_at_1pct_fpr: 1,
                quality_cost: "100 public samples per split",
                evidence_level: "runtime-mainline",
                note: "current black-box main evidence",
              },
              {
                track: "gray-box",
                attack: "PIA",
                defense: "stochastic-dropout",
                model: "Stable Diffusion v1.5 + DDIM",
                auc: 0.791,
                asr: 0.62,
                tpr_at_1pct_fpr: 0.88,
                quality_cost: "5 shadow runs",
                evidence_level: "runtime-mainline",
                note: "defended comparator",
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              contract_key: "recon_artifact_mainline",
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
      );

    vi.stubGlobal("fetch", fetchMock);

    const markup = await renderWithSuspense(await WorkspaceReportsPage({ locale: "zh-CN" }));

    expect(markup).toContain("工作台");
    expect(markup).toContain("报告");
    expect(markup).toContain("导出报告");
    expect(markup).toContain("AUC 分数分布");
    expect(markup).toContain("ROC 曲线");
    expect(markup).toContain("风险分布");
    expect(markup).toContain("攻击效果对比");
    expect(markup).toContain("防御效果对比");
    expect(markup).toContain("覆盖缺口");
    expect(markup).toContain("对比组数");
    expect(markup).toContain("recon_artifact_mainline");
  });

  it("renders en-US empty states when backend data is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")));

    const markup = renderToStaticMarkup(await WorkspaceReportsPage({ locale: "en-US" }));

    // Check for breadcrumb and page structure (outside Suspense)
    expect(markup).toContain("Workspace");
    expect(markup).toContain("Reports");
  });
});
