import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import WorkspaceAuditsPage from "./page";

const resolveLocaleFromHeaderStoreMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/locale", () => ({
  resolveLocaleFromHeaderStore: (...args: unknown[]) => resolveLocaleFromHeaderStoreMock(...args),
}));

describe("WorkspaceAuditsPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resolveLocaleFromHeaderStoreMock.mockReset();
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

    resolveLocaleFromHeaderStoreMock.mockReturnValue("zh-CN");
    const markup = renderToStaticMarkup(await WorkspaceAuditsPage());

    expect(markup).toContain("创建任务，跟踪进度，查看结果。");
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

    resolveLocaleFromHeaderStoreMock.mockReturnValue("en-US");
    const markup = renderToStaticMarkup(await WorkspaceAuditsPage());

    expect(markup).toContain("Create tasks, track progress, review results.");
    expect(markup).toContain("Create task");
    expect(markup).toContain("Running tasks");
    expect(markup).toContain("History");
  });
});
