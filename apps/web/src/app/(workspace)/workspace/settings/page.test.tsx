import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

describe("WorkspaceSettingsPage locale", () => {
  afterEach(() => {
    headersMock.mockReset();
    vi.resetModules();
  });

  it("renders zh-CN copy from the locale cookie", async () => {
    headersMock.mockResolvedValue({
      get: (name: string) =>
        name === "cookie" ? "platform-locale-v2=zh-CN; diffaudit_session=test-session" : null,
    });

    // page.tsx is a server component that renders SettingsClient
    const { default: WorkspaceSettingsPage } = await import("./page");
    const markup = renderToStaticMarkup(await WorkspaceSettingsPage());

    // SettingsClient renders the settings content for zh-CN
    expect(markup).toContain("设置");
  });
});
