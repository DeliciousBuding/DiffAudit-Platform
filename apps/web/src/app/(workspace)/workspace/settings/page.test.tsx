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

    const { default: WorkspaceSettingsPage } = await import("./page");
    const markup = renderToStaticMarkup(await WorkspaceSettingsPage());

    expect(markup).toContain("团队、密钥和个人偏好。");
    expect(markup).toContain("工作台偏好");
  });
});
