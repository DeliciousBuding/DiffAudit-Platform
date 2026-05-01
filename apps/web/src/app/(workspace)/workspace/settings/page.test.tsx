import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
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

  it("redirects to the API keys page", async () => {
    headersMock.mockResolvedValue(new Headers([["cookie", "platform-locale-v2=zh-CN; diffaudit_session=test-session"]]));
    cookiesMock.mockResolvedValue({
      get: (name: string) => (name === "diffaudit_session" ? { value: "test-session" } : undefined),
    });
    githubOAuthConfiguredMock.mockReturnValue(true);
    googleOAuthConfiguredMock.mockReturnValue(true);
    getCurrentUserProfileMock.mockReturnValue(null);

    const { default: WorkspaceSettingsPage } = await import("./page");
    await expect(async () => WorkspaceSettingsPage({})).rejects.toThrow("REDIRECT:/workspace/api-keys");
  });
});
