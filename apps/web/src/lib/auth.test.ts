import { describe, expect, it } from "vitest";

import {
  DEFAULT_REDIRECT_PATH,
  buildLoginPath,
  protectedPagePath,
  readAuthConfig,
  sanitizeRedirectPath,
  sessionTokenIsValid,
} from "./auth";

describe("single-app auth config", () => {
  it("accepts the configured session token only", () => {
    const config = readAuthConfig({
      DIFFAUDIT_SESSION_TOKEN: "session-token",
    });

    expect(sessionTokenIsValid(config, "session-token")).toBe(true);
    expect(sessionTokenIsValid(config, "other-token")).toBe(false);
  });

  it("defaults to the workspace home after sign-in", () => {
    const config = readAuthConfig({
      DIFFAUDIT_SESSION_TOKEN: "session-token",
      DIFFAUDIT_PLATFORM_URL: "https://diffaudit.vectorcontrol.tech",
    });

    expect(config.platformUrl).toBe("https://diffaudit.vectorcontrol.tech");
    expect(DEFAULT_REDIRECT_PATH).toBe("/workspace");
  });

  it("builds a same-origin login path for protected workspace routes", () => {
    expect(buildLoginPath("/workspace/audits?view=recent")).toBe(
      "/login?redirectTo=%2Fworkspace%2Faudits%3Fview%3Drecent",
    );
  });

  it("rejects absolute and protocol-relative redirect targets", () => {
    expect(sanitizeRedirectPath("https://evil.example/path")).toBe(DEFAULT_REDIRECT_PATH);
    expect(sanitizeRedirectPath("//evil.example/path")).toBe(DEFAULT_REDIRECT_PATH);
  });

  it("protects only the workspace routes and not the marketing pages", () => {
    expect(protectedPagePath("/")).toBe(false);
    expect(protectedPagePath("/trial")).toBe(false);
    expect(protectedPagePath("/workspace")).toBe(true);
    expect(protectedPagePath("/workspace/reports/preview")).toBe(true);
  });
});
