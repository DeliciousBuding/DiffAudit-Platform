import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.fn();
const useRouterMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => useRouterMock(),
  usePathname: () => "/workspace/settings",
}));

describe("WorkspaceSettingsPage locale", () => {
  afterEach(() => {
    headersMock.mockReset();
    useRouterMock.mockReset();
    vi.resetModules();
  });

  it("renders zh-CN copy from the locale cookie", async () => {
    headersMock.mockResolvedValue({
      get: (name: string) =>
        name === "cookie" ? "platform-locale-v2=zh-CN; diffaudit_session=test-session" : null,
    });

    useRouterMock.mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    });

    // page.tsx is a server component that renders SettingsClient
    const { default: WorkspaceSettingsPage } = await import("./page");
    const markup = renderToStaticMarkup(await WorkspaceSettingsPage());

    // Check for settings page structure
    expect(markup).toContain("设置");
  });
});
