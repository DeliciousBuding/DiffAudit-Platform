import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_REDIRECT_PATH,
  authPagePath,
  ensureLegacySharedUser,
  buildLoginPath,
  protectedApiPath,
  protectedPagePath,
  sanitizeRedirectPath,
  verifyCredentials,
} from "./auth";
import { resetDbForTests } from "./db";

let tempDir = "";

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "diffaudit-auth-"));
  process.env.DIFFAUDIT_DB_PATH = path.join(tempDir, "diffaudit.db");
  delete process.env.DIFFAUDIT_SHARED_USERNAME;
  delete process.env.DIFFAUDIT_SHARED_PASSWORD;
  resetDbForTests();
});

afterEach(() => {
  resetDbForTests();
  delete process.env.DIFFAUDIT_DB_PATH;
  delete process.env.DIFFAUDIT_SHARED_USERNAME;
  delete process.env.DIFFAUDIT_SHARED_PASSWORD;
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("auth route helpers", () => {
  it("defaults to the workspace home after sign-in", () => {
    expect(DEFAULT_REDIRECT_PATH).toBe("/workspace");
  });

  it("marks only auth entry pages as auth routes", () => {
    expect(authPagePath("/login")).toBe(true);
    expect(authPagePath("/register")).toBe(true);
    expect(authPagePath("/trial")).toBe(false);
  });

  it("protects only the API v1 routes", () => {
    expect(protectedApiPath("/api/v1/jobs")).toBe(true);
    expect(protectedApiPath("/api/auth/login")).toBe(false);
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

  it("bootstraps the legacy shared account into the sqlite user store", async () => {
    process.env.DIFFAUDIT_SHARED_USERNAME = "diffaudit-review";
    process.env.DIFFAUDIT_SHARED_PASSWORD = "DiffAuditTemp!2026";

    await ensureLegacySharedUser();

    await expect(
      verifyCredentials("diffaudit-review", "DiffAuditTemp!2026"),
    ).resolves.toMatchObject({ username: "diffaudit-review" });
  });

  it("updates the bootstrapped shared account when the env password changes", async () => {
    process.env.DIFFAUDIT_SHARED_USERNAME = "diffaudit-review";
    process.env.DIFFAUDIT_SHARED_PASSWORD = "DiffAuditTemp!2026";
    await ensureLegacySharedUser();

    process.env.DIFFAUDIT_SHARED_PASSWORD = "DiffAuditTemp!2027";
    await ensureLegacySharedUser();

    await expect(
      verifyCredentials("diffaudit-review", "DiffAuditTemp!2026"),
    ).resolves.toBeNull();
    await expect(
      verifyCredentials("diffaudit-review", "DiffAuditTemp!2027"),
    ).resolves.toMatchObject({ username: "diffaudit-review" });
  });
});
