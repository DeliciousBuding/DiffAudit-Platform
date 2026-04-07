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
              best_workspace: null,
              best_summary_path: null,
            },
            {
              contract_key: "white-box/gsa/ddpm-cifar10",
              track: "white-box",
              attack_family: "gsa",
              target_key: "ddpm-cifar10",
              label: "GSA on DDPM",
              availability: "ready",
              evidence_level: "best-summary",
              best_workspace: "gsa-runtime-mainline-ddpm-cifar10",
              best_summary_path: "D:/summary/gsa.json",
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
            paper: "GSA Whitebox",
            method: "gsa",
            mode: "runtime-mainline",
            backend: "gsa-engine",
            scheduler: "mainline",
            workspace:
              "D:\\Code\\DiffAudit\\Project\\experiments\\gsa-runtime-mainline-ddpm-cifar10",
            summary_path:
              "D:\\Code\\DiffAudit\\Project\\experiments\\gsa-runtime-mainline-ddpm-cifar10\\summary.json",
            metrics: {
              auc: 0.912,
              asr: 0.31,
              tpr_at_1pct_fpr: 0.92,
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
      "/api/v1/experiments/gsa-runtime-mainline-ddpm-cifar10/summary",
    );
    expect(markup).toContain("证据报告");
    expect(markup).toContain("查看当前证据摘要");
    expect(markup).toContain(
      "D:\\Code\\DiffAudit\\Project\\experiments\\gsa-runtime-mainline-ddpm-cifar10",
    );
    expect(markup).toContain("0.912");
    expect(markup).toContain("0.310");
    expect(markup).toContain("0.920");
    expect(markup).toContain("gsa-engine / mainline");
    expect(markup).toContain(
      "D:\\Code\\DiffAudit\\Project\\experiments\\gsa-runtime-mainline-ddpm-cifar10\\summary.json",
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

    expect(markup).toContain("当前证据暂不可用");
    expect(markup).toContain("未能从平台后端读取当前摘要");
    expect(markup).not.toContain("8780");
    expect(markup).not.toContain("8765");
    expect(markup).not.toContain("/api/v1/experiments/recon/best");
  });
});
