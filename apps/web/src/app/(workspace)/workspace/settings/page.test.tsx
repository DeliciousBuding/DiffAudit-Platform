import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.fn();
const cookiesMock = vi.fn();
const githubOAuthConfiguredMock = vi.fn();
const googleOAuthConfiguredMock = vi.fn();
const getCurrentUserProfileMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: headersMock,
  cookies: cookiesMock,
}));

vi.mock("@/lib/auth", () => ({
  githubOAuthConfigured: githubOAuthConfiguredMock,
  googleOAuthConfigured: googleOAuthConfiguredMock,
  getCurrentUserProfile: getCurrentUserProfileMock,
  SESSION_COOKIE_NAME: "diffaudit_session",
}));

describe("WorkspaceSettingsPage locale", () => {
  afterEach(() => {
    headersMock.mockReset();
    cookiesMock.mockReset();
    githubOAuthConfiguredMock.mockReset();
    googleOAuthConfiguredMock.mockReset();
    getCurrentUserProfileMock.mockReset();
    vi.resetModules();
  });

  it("renders zh-CN copy from the locale cookie", async () => {
    headersMock.mockResolvedValue(new Headers([["cookie", "platform-locale-v2=zh-CN; diffaudit_session=test-session"]]));
    cookiesMock.mockResolvedValue({
      get: (name: string) => (name === "diffaudit_session" ? { value: "test-session" } : undefined),
    });
    githubOAuthConfiguredMock.mockReturnValue(true);
    googleOAuthConfiguredMock.mockReturnValue(true);
    getCurrentUserProfileMock.mockReturnValue(null);

    // page.tsx is a server component that renders SettingsClient
    const { default: WorkspaceSettingsPage } = await import("./page");
    const markup = renderToStaticMarkup(await WorkspaceSettingsPage({}));

    // SettingsClient renders the settings content for zh-CN
    expect(markup).toContain("设置");
  });
});
