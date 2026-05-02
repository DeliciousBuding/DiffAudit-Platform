import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
}));

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

  it("renders settings page with SettingsClient", async () => {
    headersMock.mockResolvedValue(new Headers([["cookie", "platform-locale-v2=zh-CN; diffaudit_session=test-session"]]));
    cookiesMock.mockResolvedValue({
      get: (name: string) => (name === "diffaudit_session" ? { value: "test-session" } : undefined),
    });
    githubOAuthConfiguredMock.mockReturnValue(true);
    googleOAuthConfiguredMock.mockReturnValue(true);
    getCurrentUserProfileMock.mockReturnValue(null);

    const { default: WorkspaceSettingsPage } = await import("./page");
    const result = await WorkspaceSettingsPage({});
    expect(result).toBeDefined();
    expect(result.props.mode).toBe("settings");
  });
});
