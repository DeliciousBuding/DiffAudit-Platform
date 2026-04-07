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
              contract_key: "gray-box/pia/cifar10-ddpm",
              track: "gray-box",
              attack_family: "pia",
              target_key: "cifar10-ddpm",
              label: "PIA Runtime Mainline",
              paper: "PIA",
              availability: "ready",
              evidence_level: "best-summary",
              backend: null,
              scheduler: null,
              best_summary_path: "D:/summary/pia.json",
              best_workspace: "pia-cifar10-runtime-mainline-20260407-cpu",
            },
            {
              contract_key: "white-box/gsa/ddpm-cifar10",
              track: "white-box",
              attack_family: "gsa",
              target_key: "ddpm-cifar10",
              label: "GSA Runtime Mainline",
              paper: "GSA",
              availability: "partial",
              evidence_level: "best-summary",
              backend: null,
              scheduler: null,
              best_summary_path: "D:/summary/gsa.json",
              best_workspace: "gsa-runtime-mainline-20260407-cpu",
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

    expect(markup).toContain("系统状态");
    expect(markup).toContain("统一查看当前目录中的能力状态");
    expect(markup).toContain("三线目录状态");
    expect(markup).toContain("black-box");
    expect(markup).toContain("gray-box");
    expect(markup).toContain("white-box");
    expect(markup).toContain("black-box/recon/sd15-ddim");
    expect(markup).toContain("best-summary");
    expect(markup).toContain("已发布条目");
    expect(markup).toContain("未发布");
    expect(markup).toContain("gray-box/pia/cifar10-ddpm");
    expect(markup).toContain("white-box/gsa/ddpm-cifar10");
    expect(markup).toContain("PIA Runtime Mainline");
    expect(markup).toContain("GSA Runtime Mainline");
    expect(markup).not.toContain("准备态或 smoke 证据");
    expect(markup).not.toContain("黑盒特例逻辑");
    expect(markup).not.toContain("fan-out");
    expect(markup).not.toContain("dashboard 壳");
    expect(markup).not.toContain("catalog -&gt; summary");
  });

  it("shows a clear unavailable state when the catalog is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")));

    const markup = renderToStaticMarkup(await DashboardPage());

    expect(markup).toContain("系统状态暂时不可用");
    expect(markup).toContain("暂时无法加载三条线的状态信息");
    expect(markup).not.toContain("/api/v1/catalog");
  });
});
