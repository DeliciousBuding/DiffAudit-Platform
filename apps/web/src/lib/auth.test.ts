import { describe, expect, it } from "vitest";

import {
  buildPortalLoginUrl,
  readAuthConfig,
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
    });

    expect(
      buildPortalLoginUrl(config, "http://localhost:3000/audit", "/audit?tab=live"),
    ).toBe("http://localhost:3001/login?redirectTo=http%3A%2F%2Flocalhost%3A3000%2Faudit%3Ftab%3Dlive");
  });
});
