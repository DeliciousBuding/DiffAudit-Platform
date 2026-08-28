import React from "react";
import { renderToReadableStream } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/router/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ refresh: () => {} }),
}));

const githubOAuthConfiguredMock = vi.fn();
const googleOAuthConfiguredMock = vi.fn();

vi.mock("@/lib/locale", () => ({
  clientLocale: () => "zh-CN",
  resolveLocaleFromCookieHeader: () => "zh-CN",
  resolveLocaleFromHeaderStore: () => "zh-CN",
}));

vi.mock("@/lib/auth-config", () => ({
  githubOAuthConfigured: githubOAuthConfiguredMock,
  googleOAuthConfigured: googleOAuthConfiguredMock,
  clientSessionToken: () => "test-session",
  SESSION_COOKIE_NAME: "diffaudit_session",
}));

describe("WorkspaceAccountPage locale", () => {
  afterEach(() => {
    githubOAuthConfiguredMock.mockReset();
    googleOAuthConfiguredMock.mockReset();
    vi.resetModules();
  });

  it("renders zh-CN account copy from the locale cookie", async () => {
    githubOAuthConfiguredMock.mockReturnValue(true);
    googleOAuthConfiguredMock.mockReturnValue(true);

    const { default: WorkspaceAccountPage } = await import("./page");
    const stream = await renderToReadableStream(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/workspace/account?emailVerified=1"] },
        React.createElement(WorkspaceAccountPage),
      ),
    );
    await stream.allReady;
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let markup = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      markup += decoder.decode(value, { stream: true });
    }
    expect(markup).toContain("账户");
  });
});
