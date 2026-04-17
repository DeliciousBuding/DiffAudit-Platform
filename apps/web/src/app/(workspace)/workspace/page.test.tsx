import { renderToReadableStream } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

async function renderMarkup(element: React.ReactNode) {
  const stream = await renderToReadableStream(element);
  await stream.allReady;
  return await new Response(stream).text();
}

describe("WorkspaceHomePage", () => {
  afterEach(() => {
    headersMock.mockReset();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("renders zh-CN copy with backend data", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

      if (url.includes("/api/v1/catalog")) {
        return new Response(
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
        );
      }

      if (url.includes("/api/v1/evidence/attack-defense-table")) {
        return new Response(
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
        );
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "zh-CN"]]));
    const { default: WorkspaceHomePage } = await import("./page");
    const markup = await renderMarkup(await WorkspaceHomePage());

    expect(markup).toContain("这里汇总了当前正在运行的审计任务、最近的审计结果，以及系统的连接状态。");
    expect(markup).toContain("当前任务");
    expect(markup).toContain("最近结果");
    expect(markup).toContain("PIA GPU512 baseline");
    expect(markup).toContain("可审计合同");
    expect(markup).toContain("已防御结果");
  });

  it("renders en-US copy when backend data is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")));

    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "en-US"]]));
    const { default: WorkspaceHomePage } = await import("./page");
    const markup = await renderMarkup(await WorkspaceHomePage());

    expect(markup).toContain("Your workspace aggregates current audit tasks, recent results, and system status at a glance.");
    expect(markup).toContain("Active tasks");
    expect(markup).toContain("Recent results");
    expect(markup).toContain("No audit results yet — create a task to get started.");
    expect(markup).toContain("Auditable contracts");
  });
});
