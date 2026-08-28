// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.fn();
const headersMock = vi.fn();
const validateSessionMock = vi.fn();
const resolveLocaleFromHeaderStoreMock = vi.fn();


vi.mock("@/lib/auth-config", () => ({
  SESSION_COOKIE_NAME: "diffaudit_session",
  clientLoggedIn: () => false,

}));

vi.mock("@/lib/locale", () => ({
  clientLocale: () => "zh-CN",
  resolveLocaleFromHeaderStore: resolveLocaleFromHeaderStoreMock,
  resolveLocaleFromCookieHeader: () => "zh-CN",
}));

vi.mock("@/components/marketing-home", () => ({
  MarketingHome: ({
    loggedIn,
    workbenchUrl,
    initialLocale,
  }: {
    loggedIn: boolean;
    workbenchUrl?: string;
    initialLocale?: string;
  }) => React.createElement("div", {
    "data-logged-in": String(loggedIn),
    "data-workbench-url": workbenchUrl,
    "data-initial-locale": initialLocale,
  }),
}));

describe("Marketing HomePage", () => {
  afterEach(() => {
    cookiesMock.mockReset();
    headersMock.mockReset();
    validateSessionMock.mockReset();
    resolveLocaleFromHeaderStoreMock.mockReset();
    vi.resetModules();
  });

  it("passes the resolved server locale into MarketingHome", async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });
    document.cookie = "platform-locale-v2=zh-CN";
    validateSessionMock.mockReturnValue(null);
    resolveLocaleFromHeaderStoreMock.mockReturnValue("zh-CN");

    const { default: HomePage } = await import("./page");
    const markup = renderToStaticMarkup(await HomePage());

    expect(markup).toContain('data-initial-locale="zh-CN"');
    expect(markup).toContain('data-workbench-url="/workspace/start"');
    expect(markup).toContain('data-logged-in="false"');
  });
});
