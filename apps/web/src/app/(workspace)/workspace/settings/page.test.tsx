import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.fn();
const cookiesMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: headersMock,
  cookies: cookiesMock,
}));

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return {
    ...actual,
    googleOAuthConfigured: () => true,
    githubOAuthConfigured: () => true,
  };
});

describe("WorkspaceSettingsPage locale", () => {
  afterEach(() => {
    headersMock.mockReset();
    cookiesMock.mockReset();
    vi.resetModules();
  });

  it("renders zh-CN copy from the locale cookie", async () => {
    headersMock.mockResolvedValue({
      get: (name: string) =>
        name === "cookie" ? "platform-locale-v2=zh-CN; diffaudit_session=test-session" : null,
    });
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });

    // page.tsx is a server component that renders SettingsClient
    const { default: WorkspaceSettingsPage } = await import("./page");
    const markup = renderToStaticMarkup(await WorkspaceSettingsPage({
      searchParams: Promise.resolve({}),
    }));

    // SettingsClient renders the settings content for zh-CN
    expect(markup).toContain("设置");
  });

  it("accepts email verification search params without breaking server rendering", async () => {
    headersMock.mockResolvedValue({
      get: (name: string) =>
        name === "cookie" ? "platform-locale-v2=zh-CN; diffaudit_session=test-session" : null,
    });
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });

    const { default: WorkspaceSettingsPage } = await import("./page");
    const markup = renderToStaticMarkup(await WorkspaceSettingsPage({
      searchParams: Promise.resolve({ emailVerified: "1" }),
    }));

    expect(markup).toContain("账户");
  });
});
