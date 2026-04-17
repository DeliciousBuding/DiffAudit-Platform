import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWorkspaceHomePage } from "./page";

describe("WorkspaceHomePage", () => {
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
                track: "gray-box",
                attack: "PIA GPU512 baseline",
                defense: "provisional G-1 = stochastic-dropout",
                model: "CIFAR-10 DDPM",
                auc: 0.82938,
                asr: 0.769531,
                tpr_at_1pct_fpr: 0.023438,
                quality_cost: "512 samples per split",
                evidence_level: "runtime-mainline",
                note: "current gray-box defended main result",
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    const markup = renderToStaticMarkup(await renderWorkspaceHomePage({ locale: "zh-CN" }));

    expect(markup).toContain("待办、审计结果和关键指标。");
    expect(markup).toContain("当前待办");
    expect(markup).toContain("最近结果");
    expect(markup).toContain("PIA GPU512 baseline");
    expect(markup).toContain("活跃合同");
    expect(markup).toContain("已防御行");
  });

  it("renders en-US copy when backend data is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")));

    const markup = renderToStaticMarkup(await renderWorkspaceHomePage({ locale: "en-US" }));

    expect(markup).toContain("Tasks, audit results, and key metrics.");
    expect(markup).toContain("Current tasks");
    expect(markup).toContain("Recent results");
    expect(markup).toContain("No audit results yet. Create a job in the audits page.");
    expect(markup).toContain("Live contracts");
  });
});
