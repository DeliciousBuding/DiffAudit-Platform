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
              contract_key: "black-box/recon/sd15-ddim",
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
              contract_key: "gray-box/pia/sd15-ddim",
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

    expect(markup).toContain("三轨系统状态");
    expect(markup).toContain("统一三线当前能力与证据状态");
    expect(markup).toContain("三线目录状态");
    expect(markup).toContain("black-box");
    expect(markup).toContain("gray-box");
    expect(markup).toContain("white-box");
    expect(markup).toContain("black-box/recon/sd15-ddim");
    expect(markup).toContain("gray-box/pia/sd15-ddim");
    expect(markup).toContain("best-summary");
    expect(markup).toContain("当前无 catalog 条目");
    expect(markup).toContain("主线证据可读");
    expect(markup).toContain("准备态或 smoke 证据");
    expect(markup).not.toContain("黑盒特例逻辑");
    expect(markup).not.toContain("fan-out");
    expect(markup).not.toContain("dashboard 壳");
    expect(markup).not.toContain("catalog -&gt; summary");
  });

  it("shows a clear unavailable state when the catalog is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")));

    const markup = renderToStaticMarkup(await DashboardPage());

    expect(markup).toContain("系统状态暂时不可用");
    expect(markup).toContain("三线能力目录暂时无法加载");
    expect(markup).not.toContain("/api/v1/catalog");
  });
});
