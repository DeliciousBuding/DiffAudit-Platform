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

    expect(markup).toContain("审计结果和覆盖缺口");
    expect(markup).toContain("任务报告");
    expect(markup).toContain("任务报告表");
    expect(markup).toContain("photo-real-xl");
    expect(markup).toContain("查看审计报告");
  });

  it("renders en-US copy with forced demo data", async () => {
    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "en-US"]]));
    const { default: WorkspaceReportsPage } = await import("./page");
    const markup = await renderMarkup(await WorkspaceReportsPage());

    expect(markup).toContain("Audit results and coverage gaps");
    expect(markup).toContain("Task reports");
    expect(markup).toContain("Task reports table");
    expect(markup).toContain("photo-real-xl");
    expect(markup).toContain("View Report");
  });
});
