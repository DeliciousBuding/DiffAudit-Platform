// @vitest-environment jsdom
import { renderToReadableStream } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, refresh: () => {}, replace: () => {} }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
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
    document.cookie = "platform-locale-v2=zh-CN";
    const { default: WorkspaceHomePage } = await import("./start/page");
    const markup = await renderMarkup(await WorkspaceHomePage());

    expect(markup).toContain("工作台总览");
    expect(markup).toContain("AUC 风险分布");
    expect(markup).toContain("近期任务");
    expect(markup).toContain("PIA");
    expect(markup).toContain("stable-diffusion-v1-4");
    expect(markup).toContain("可审计模型");
    expect(markup).toContain("已评估防御");
  });

  it("renders en-US copy with forced demo data", async () => {
    document.cookie = "platform-locale-v2=en-US";
    const { default: WorkspaceHomePage } = await import("./start/page");
    const markup = await renderMarkup(await WorkspaceHomePage());

    expect(markup).toContain("Workspace Overview");
    expect(markup).toContain("AUC Risk Distribution");
    expect(markup).toContain("Recent tasks");
    expect(markup).toContain("stable-diffusion-v1-4");
    expect(markup).toContain("Auditable models");
  });
});
