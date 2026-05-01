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

describe("WorkspaceAuditsPage", () => {
  afterEach(() => {
    headersMock.mockReset();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("renders zh-CN copy without blocking on live jobs", async () => {
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
      );

    vi.stubGlobal("fetch", fetchMock);

    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "zh-CN"]]));
    const { default: WorkspaceAuditsPage } = await import("./page");
    const markup = await renderMarkup(await WorkspaceAuditsPage());

    expect(markup).toContain("创建任务，跟踪进度，查看结果");
    expect(markup).toContain("创建任务");
    expect(markup).toContain("运行中的任务");
    expect(markup).toContain("历史任务");
  });

  it("renders en-US page with primary create task button", async () => {
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
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "en-US"]]));
    const { default: WorkspaceAuditsPage } = await import("./page");
    const markup = await renderMarkup(await WorkspaceAuditsPage());

    expect(markup).toContain("Create tasks, track progress, review results");
    expect(markup).toContain("Create task");
    expect(markup).toContain("Active tasks");
    expect(markup).toContain("History");
  });
});
