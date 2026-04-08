import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import ReportPage from "./page";

describe("ReportPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders admitted attack-defense results from the backend", async () => {
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
            {
              contract_key: "gray-box/pia/cifar10-ddpm",
              track: "gray-box",
              attack_family: "pia",
              target_key: "cifar10-ddpm",
              label: "PIA Runtime Mainline",
              availability: "ready",
              evidence_level: "best-summary",
              best_workspace: "pia-cifar10-runtime-mainline-20260407-cpu",
              system_gap: "expose cost columns consistently",
            },
          ]),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
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
                tpr_at_1pct_fpr: 1.0,
                quality_cost: "100 public samples per split",
                evidence_level: "runtime-mainline",
                note: "current black-box main evidence",
              },
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
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    const markup = renderToStaticMarkup(await ReportPage());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/api/v1/catalog");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/api/v1/evidence/attack-defense-table");
    expect(markup).toContain("证据报告");
    expect(markup).toContain("查看当前 admitted 攻击、防御结果和系统缺口");
    expect(markup).toContain("Admitted 攻防结果");
    expect(markup).toContain("recon DDIM public-100 step30");
    expect(markup).toContain("PIA GPU512 baseline");
    expect(markup).toContain("0.849");
    expect(markup).toContain("0.510");
    expect(markup).toContain("surface semantic limits cleanly");
    expect(markup).toContain("Current gap");
    expect(markup).not.toContain("最佳证据摘要");
    expect(markup).not.toContain("source of truth");
    expect(markup).not.toContain("研究实验");
    expect(markup).not.toContain("平台前端");
    expect(markup).not.toContain("飞书");
    expect(markup).not.toContain("blackbox-status");
    expect(markup).not.toContain("mock");
    expect(markup).not.toContain("最佳 recon 证据");
  });

  it("shows a clear unavailable state when the backend is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")),
    );

    const markup = renderToStaticMarkup(await ReportPage());

    expect(markup).toContain("当前 admitted 结果暂不可用");
    expect(markup).toContain("未能从平台后端读取统一主表或目录状态");
    expect(markup).not.toContain("8780");
    expect(markup).not.toContain("8765");
    expect(markup).not.toContain("/api/v1/evidence/attack-defense-table");
  });
});
