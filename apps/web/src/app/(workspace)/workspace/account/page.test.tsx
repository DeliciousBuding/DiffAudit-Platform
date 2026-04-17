import { renderToStaticMarkup } from "react-dom/server";
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

describe("WorkspaceAccountPage locale", () => {
  afterEach(() => {
    headersMock.mockReset();
    cookiesMock.mockReset();
    githubOAuthConfiguredMock.mockReset();
    googleOAuthConfiguredMock.mockReset();
    getCurrentUserProfileMock.mockReset();
    vi.resetModules();
  });

  it("renders zh-CN account copy from the locale cookie", async () => {
    headersMock.mockResolvedValue(new Headers([["cookie", "platform-locale-v2=zh-CN; diffaudit_session=test-session"]]));
    cookiesMock.mockResolvedValue({
      get: (name: string) => (name === "diffaudit_session" ? { value: "test-session" } : undefined),
    });
    githubOAuthConfiguredMock.mockReturnValue(true);
    googleOAuthConfiguredMock.mockReturnValue(true);
    getCurrentUserProfileMock.mockReturnValue(null);

    const { default: WorkspaceAccountPage } = await import("./page");
    const markup = renderToStaticMarkup(await WorkspaceAccountPage({}));

    expect(markup).toContain("账户");
  });
});
