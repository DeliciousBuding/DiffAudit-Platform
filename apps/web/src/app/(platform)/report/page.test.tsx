import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import ReportPage from "./page";

describe("ReportPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the best recon evidence from the backend", async () => {
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
              best_workspace:
                "recon-runtime-mainline-ddim-public-100-step30",
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
      );

    vi.stubGlobal("fetch", fetchMock);

    const markup = renderToStaticMarkup(await ReportPage());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/api/v1/catalog");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain(
      "/api/v1/experiments/recon-runtime-mainline-ddim-public-100-step30/summary",
    );
    expect(markup).toContain("单条 evidence 深读");
    expect(markup).toContain("当前选定 evidence 来自");
    expect(markup).toContain(
      "D:\\Code\\DiffAudit\\Project\\experiments\\recon-runtime-mainline-ddim-public-100-step30",
    );
    expect(markup).toContain("0.849");
    expect(markup).toContain("0.510");
    expect(markup).toContain("1.000");
    expect(markup).toContain("stable_diffusion / ddim");
    expect(markup).toContain(
      "D:\\Code\\DiffAudit\\Project\\experiments\\recon-runtime-mainline-ddim-public-100-step30\\summary.json",
    );
    expect(markup).not.toContain("best evidence workspace");
    expect(markup).not.toContain("source of truth");
    expect(markup).not.toContain("研究实验");
    expect(markup).not.toContain("平台前端");
    expect(markup).not.toContain("飞书");
    expect(markup).not.toContain("blackbox-status");
    expect(markup).not.toContain("mock");
    expect(markup).not.toContain("上层联调");
    expect(markup).not.toContain("最佳 recon 证据");
    expect(markup).not.toContain("black-box recon 证据");
  });

  it("shows a clear unavailable state when the backend is unreachable", async () => {
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
              availability: "ready",
              evidence_level: "best-summary",
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

    const markup = renderToStaticMarkup(await ReportPage());

    expect(markup).toContain("当前 evidence 暂不可用");
    expect(markup).toContain("未能从平台后端读取当前最佳实验摘要");
    expect(markup).not.toContain("8780");
    expect(markup).not.toContain("8765");
    expect(markup).not.toContain("/api/v1/experiments/recon/best");
  });
});
