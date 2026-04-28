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

  it("renders zh-CN copy with forced demo data", async () => {
    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "zh-CN"]]));
    const { default: WorkspaceHomePage } = await import("./page");
    const markup = await renderMarkup(await WorkspaceHomePage());

    expect(markup).toContain("这里汇总了当前正在运行的审计任务、最近的审计结果，以及系统的连接状态。");
    expect(markup).toContain("当前任务");
    expect(markup).toContain("最近结果");
    expect(markup).toContain("PIA");
    expect(markup).toContain("stable-diffusion-v1-4");
    expect(markup).toContain("可审计合同");
    expect(markup).toContain("已防御结果");
  });

  it("renders en-US copy with forced demo data", async () => {
    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "en-US"]]));
    const { default: WorkspaceHomePage } = await import("./page");
    const markup = await renderMarkup(await WorkspaceHomePage());

    expect(markup).toContain("Your workspace aggregates current audit tasks, recent results, and system status at a glance.");
    expect(markup).toContain("Active tasks");
    expect(markup).toContain("Recent results");
    expect(markup).toContain("Recon Member Inference Audit");
    expect(markup).toContain("Auditable contracts");
    expect(markup).toContain("Auditable contracts");
  });
});
