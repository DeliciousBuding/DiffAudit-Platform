import { describe, expect, it } from "vitest";

import {
  credentialsAreValid,
  readAuthConfig,
  sessionTokenIsValid,
} from "./auth";

describe("temporary auth config", () => {
  it("rejects login when credentials do not match", () => {
    const config = readAuthConfig({
      DIFFAUDIT_SHARED_USERNAME: "diffaudit-review",
      DIFFAUDIT_SHARED_PASSWORD: "DiffAuditTemp!2026",
      DIFFAUDIT_SESSION_TOKEN: "session-token",
    });

    expect(
      credentialsAreValid(config, {
        username: "diffaudit-review",
        password: "wrong-password",
      }),
    ).toBe(false);
  });

  it("accepts the configured session token only", () => {
    const config = readAuthConfig({
      DIFFAUDIT_SHARED_USERNAME: "diffaudit-review",
      DIFFAUDIT_SHARED_PASSWORD: "DiffAuditTemp!2026",
      DIFFAUDIT_SESSION_TOKEN: "session-token",
    });

    expect(sessionTokenIsValid(config, "session-token")).toBe(true);
    expect(sessionTokenIsValid(config, "other-token")).toBe(false);
  });
});
