import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import DashboardPage from "./page";

describe("DashboardPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the unified catalog shell from backend catalog entries", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              key: "black-box/recon/sd15-ddim",
              track: "black-box",
              attack_family: "recon",
              target_key: "sd15-ddim",
              label: "Stable Diffusion 1.5 DDIM Recon",
              paper: "BlackBox_Reconstruction_ArXiv2023",
              availability: "ready",
              evidence_level: "best-summary",
              backend: "stable_diffusion",
              scheduler: "ddim",
              best_summary_path: "D:/summary/recon.json",
              best_workspace: "recon-runtime-mainline-ddim-public-100-step30",
            },
            {
              key: "gray-box/pia/sd15-ddim",
              track: "gray-box",
              attack_family: "pia",
              target_key: "sd15-ddim",
              label: "PIA Smoke",
              paper: "PIA_2024",
              availability: "partial",
              evidence_level: "catalog",
              backend: null,
              scheduler: null,
              best_summary_path: null,
              best_workspace: null,
            },
          ]),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      ),
    );

    const markup = renderToStaticMarkup(await DashboardPage());

    expect(markup).toContain("统一 evidence / catalog 展示壳");
    expect(markup).toContain("三线目录状态");
    expect(markup).toContain("black-box");
    expect(markup).toContain("gray-box");
    expect(markup).toContain("white-box");
    expect(markup).toContain("black-box/recon/sd15-ddim");
    expect(markup).toContain("gray-box/pia/sd15-ddim");
    expect(markup).toContain("best-summary");
    expect(markup).toContain("catalog -&gt; summary");
    expect(markup).toContain("当前无 catalog 条目");
  });

  it("shows a clear unavailable state when the catalog is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")));

    const markup = renderToStaticMarkup(await DashboardPage());

    expect(markup).toContain("统一 catalog 暂不可用");
    expect(markup).toContain("先恢复 /api/v1/catalog");
  });
});
