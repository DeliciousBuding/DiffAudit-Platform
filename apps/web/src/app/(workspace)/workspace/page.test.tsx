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
    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "zh-CN"]]));
    const { default: WorkspaceHomePage } = await import("./start/page");
    const markup = await renderMarkup(await WorkspaceHomePage());

    expect(markup).toContain("建议操作");
    expect(markup).toContain("最近结果");
    expect(markup).toContain("PIA");
    expect(markup).toContain("stable-diffusion-v1-4");
    expect(markup).toContain("可审计模型");
    expect(markup).toContain("已防御结果");
  });

  it("renders en-US copy with forced demo data", async () => {
    headersMock.mockResolvedValue(new Headers([["x-platform-locale", "en-US"]]));
    const { default: WorkspaceHomePage } = await import("./start/page");
    const markup = await renderMarkup(await WorkspaceHomePage());

    expect(markup).toContain("Suggested actions");
    expect(markup).toContain("Recent results");
    expect(markup).toContain("stable-diffusion-v1-4");
    expect(markup).toContain("Auditable models");
  });
});
