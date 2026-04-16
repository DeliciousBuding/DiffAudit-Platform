import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import WorkspaceHomePage from "./page";

const resolveLocaleFromHeaderStoreMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/locale", () => ({
  resolveLocaleFromHeaderStore: (...args: unknown[]) => resolveLocaleFromHeaderStoreMock(...args),
}));

describe("WorkspaceHomePage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resolveLocaleFromHeaderStoreMock.mockReset();
  });

  it("renders zh-CN shell copy with suspense fallback", async () => {
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

    resolveLocaleFromHeaderStoreMock.mockReturnValue("zh-CN");
    const markup = renderToStaticMarkup(await WorkspaceHomePage());

    expect(markup).toContain("看看你的模型泄露了什么。");
    expect(markup).toContain("这里汇总了当前正在运行的审计任务、最近的审计结果，以及系统的连接状态。");
    expect(markup).toContain("animate-pulse");
  });

  it("renders en-US shell copy when backend data is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")));

    resolveLocaleFromHeaderStoreMock.mockReturnValue("en-US");
    const markup = renderToStaticMarkup(await WorkspaceHomePage());

    expect(markup).toContain("See what your model is leaking.");
    expect(markup).toContain("Your workspace aggregates current audit tasks, recent results, and system status at a glance.");
    expect(markup).toContain("animate-pulse");
  });
});
