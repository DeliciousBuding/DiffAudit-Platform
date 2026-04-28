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

describe("WorkspaceReportsPage", () => {
  afterEach(() => {
    headersMock.mockReset();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("renders zh-CN copy with forced demo data", async () => {
    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "zh-CN"]]));
    const { default: WorkspaceReportsPage } = await import("./page");
    const markup = await renderMarkup(await WorkspaceReportsPage());

    expect(markup).toContain("审计结果和覆盖缺口。");
    expect(markup).toContain("这里汇总了所有审计结果，帮你发现模型防御的薄弱环节。");
    expect(markup).toContain("审计结果");
    expect(markup).toContain("覆盖缺口");
    expect(markup).toContain("recon");
    expect(markup).toContain("证据边界");
    expect(markup).toContain("来源路径");
    expect(markup).toContain("导出报告");
  });

  it("renders en-US copy with forced demo data", async () => {
    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "en-US"]]));
    const { default: WorkspaceReportsPage } = await import("./page");
    const markup = await renderMarkup(await WorkspaceReportsPage());

    expect(markup).toContain("Audit results and coverage gaps.");
    expect(markup).toContain("Aggregate audit results and identify weak spots in your model&#x27;s defenses.");
    expect(markup).toContain("recon");
    expect(markup).toContain("stable-diffusion-v1-4");
    expect(markup).toContain("Export report");
  });
});
