import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import ReportPage from "./page";

describe("ReportPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the best recon evidence from the backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: "ready",
            paper: "BlackBox_Reconstruction_ArXiv2023",
            method: "recon",
            mode: "runtime-mainline",
            backend: "stable_diffusion",
            scheduler: "ddim",
            workspace:
              "D:\\Code\\DiffAudit\\Project\\experiments\\recon-runtime-mainline-ddim-public-100-step30",
            summary_path:
              "D:\\Code\\DiffAudit\\Project\\experiments\\recon-runtime-mainline-ddim-public-100-step30\\summary.json",
            metrics: {
              auc: 0.849,
              asr: 0.51,
              tpr_at_1pct_fpr: 1.0,
            },
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      ),
    );

    const markup = renderToStaticMarkup(await ReportPage());

    expect(markup).toContain("recon-runtime-mainline-ddim-public-100-step30");
    expect(markup).toContain("0.849");
    expect(markup).toContain("0.510");
    expect(markup).toContain("1.000");
    expect(markup).toContain("stable_diffusion / ddim");
  });

  it("shows a clear unavailable state when the backend is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")));

    const markup = renderToStaticMarkup(await ReportPage());

    expect(markup).toContain("最佳 recon 证据暂不可用");
    expect(markup).toContain("未能从平台后端读取当前最佳实验摘要");
  });
});
