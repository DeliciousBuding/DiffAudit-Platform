import { describe, expect, it } from "vitest";

import {
  buildPortalLoginUrl,
  DEFAULT_REDIRECT_PATH,
  readAuthConfig,
  sanitizeRedirectPath,
  sessionTokenIsValid,
} from "./auth";

describe("temporary auth config", () => {
  it("accepts the configured session token only", () => {
    const config = readAuthConfig({
      DIFFAUDIT_SESSION_TOKEN: "session-token",
    });

    expect(sessionTokenIsValid(config, "session-token")).toBe(true);
    expect(sessionTokenIsValid(config, "other-token")).toBe(false);
  });

  it("builds a same-origin portal login URL with a path redirect", () => {
    const config = readAuthConfig({
      DIFFAUDIT_SESSION_TOKEN: "session-token",
      DIFFAUDIT_PORTAL_URL: "https://diffaudit.vectorcontrol.tech",
    });

    expect(
      buildPortalLoginUrl(config, "https://diffaudit.vectorcontrol.tech/audit", "/audit?tab=live"),
    ).toBe("https://diffaudit.vectorcontrol.tech/login?redirectTo=%2Faudit%3Ftab%3Dlive");
  });

  it("builds a cross-origin portal login URL with an absolute redirect", () => {
    const config = readAuthConfig({
      DIFFAUDIT_SESSION_TOKEN: "session-token",
      DIFFAUDIT_PORTAL_URL: "http://localhost:3001",
      DIFFAUDIT_PLATFORM_URL: "http://localhost:3000",
    });

    expect(
      buildPortalLoginUrl(config, "http://localhost:3000/audit", "/audit?tab=live"),
    ).toBe("http://localhost:3001/login?redirectTo=http%3A%2F%2Flocalhost%3A3000%2Faudit%3Ftab%3Dlive");
  });

  it("rejects absolute and protocol-relative redirect targets", () => {
    expect(sanitizeRedirectPath("https://evil.example/path")).toBe(DEFAULT_REDIRECT_PATH);
    expect(sanitizeRedirectPath("//evil.example/path")).toBe(DEFAULT_REDIRECT_PATH);
  });

  it("falls back to the default redirect when callers pass an unsafe path", () => {
    const config = readAuthConfig({
      DIFFAUDIT_SESSION_TOKEN: "session-token",
      DIFFAUDIT_PORTAL_URL: "https://diffaudit.vectorcontrol.tech",
    });

    expect(
      buildPortalLoginUrl(
        config,
        "https://diffaudit.vectorcontrol.tech/login",
        "https://evil.example/path",
      ),
    ).toBe("https://diffaudit.vectorcontrol.tech/login?redirectTo=%2Faudit");
  });
});
