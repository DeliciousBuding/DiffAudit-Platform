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

    expect(markup).toContain("报告生成");
    expect(markup).toContain("按审计模式生成");
    expect(markup).toContain("已生成报告");
    expect(markup).toContain("综合分析");
    expect(markup).toContain("导出报告");
  });

  it("renders en-US copy with forced demo data", async () => {
    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "en-US"]]));
    const { default: WorkspaceReportsPage } = await import("./page");
    const markup = await renderMarkup(await WorkspaceReportsPage());

    expect(markup).toContain("Reports");
    expect(markup).toContain("Report Generation");
    expect(markup).toContain("Generate by Audit Mode");
    expect(markup).toContain("Generated Reports");
    expect(markup).toContain("Comprehensive Analysis");
    expect(markup).toContain("Export report");
  });
});
