import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_REDIRECT_PATH,
  authPagePath,
  ensureLegacySharedUser,
  buildLoginPath,
  githubOAuthConfigured,
  googleOAuthConfigured,
  protectedApiPath,
  protectedPagePath,
  resolveConfiguredPlatformUrl,
  resolvePlatformUrl,
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
  delete process.env.DIFFAUDIT_PLATFORM_URL;
  resetDbForTests();
});

afterEach(() => {
  resetDbForTests();
  delete process.env.DIFFAUDIT_DB_PATH;
  delete process.env.DIFFAUDIT_SHARED_USERNAME;
  delete process.env.DIFFAUDIT_SHARED_PASSWORD;
  delete process.env.DIFFAUDIT_PLATFORM_URL;
  vi.unstubAllEnvs();
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

  it("rejects redirect targets that can be normalized into external origins", () => {
    expect(sanitizeRedirectPath("/\\\\evil.example/path")).toBe(DEFAULT_REDIRECT_PATH);
    expect(sanitizeRedirectPath("/%5C%5Cevil.example/path")).toBe(DEFAULT_REDIRECT_PATH);
    expect(sanitizeRedirectPath("/%5c%5cevil.example/path")).toBe(DEFAULT_REDIRECT_PATH);
  });

  it("rejects redirect targets with whitespace or control characters", () => {
    expect(sanitizeRedirectPath(" /workspace")).toBe(DEFAULT_REDIRECT_PATH);
    expect(sanitizeRedirectPath("/workspace ")).toBe(DEFAULT_REDIRECT_PATH);
    expect(sanitizeRedirectPath("/\t/evil.example")).toBe(DEFAULT_REDIRECT_PATH);
    expect(sanitizeRedirectPath("/%09/evil.example")).toBe(DEFAULT_REDIRECT_PATH);
  });

  it("protects only the workspace routes and not the marketing pages", () => {
    expect(protectedPagePath("/")).toBe(false);
    expect(protectedPagePath("/trial")).toBe(false);
    expect(protectedPagePath("/workspace")).toBe(true);
    expect(protectedPagePath("/workspace/reports/preview")).toBe(true);
  });

  it("only enables github oauth when both credentials are present", () => {
    expect(githubOAuthConfigured({})).toBe(false);
    expect(githubOAuthConfigured({ GITHUB_CLIENT_ID: "client-only" })).toBe(false);
    expect(
      githubOAuthConfigured({
        GITHUB_CLIENT_ID: "client-id",
        GITHUB_CLIENT_SECRET: "client-secret",
      }),
    ).toBe(true);
  });

  it("only enables google oauth when both credentials are present", () => {
    expect(googleOAuthConfigured({})).toBe(false);
    expect(googleOAuthConfigured({ GOOGLE_CLIENT_ID: "client-only" })).toBe(false);
    expect(
      googleOAuthConfigured({
        GOOGLE_CLIENT_ID: "client-id",
        GOOGLE_CLIENT_SECRET: "client-secret",
      }),
    ).toBe(true);
  });

  it("rejects bind-only configured platform URLs in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.DIFFAUDIT_PLATFORM_URL = "http://0.0.0.0:3000";

    const request = new Request("http://127.0.0.1:3000/api/auth/google", {
      headers: {
        host: "attacker.example.test",
        "x-forwarded-host": "attacker.example.test",
        "x-forwarded-proto": "https",
      },
    });

    expect(resolvePlatformUrl(request)).toBeNull();
    expect(resolveConfiguredPlatformUrl()).toBeNull();
  });

  it("rejects unconfigured production platform URLs instead of trusting forwarded hosts", () => {
    vi.stubEnv("NODE_ENV", "production");

    const request = new Request("https://internal.invalid/api/auth/google", {
      headers: {
        host: "attacker.example.test",
        "x-forwarded-host": "attacker.example.test",
        "x-forwarded-proto": "https",
      },
    });

    expect(resolvePlatformUrl(request)).toBeNull();
  });

  it("keeps localhost origin fallback for local development only", () => {
    vi.stubEnv("NODE_ENV", "development");

    const request = new Request("http://127.0.0.1:3000/api/auth/google", {
      headers: {
        host: "attacker.example.test",
        "x-forwarded-host": "attacker.example.test",
        "x-forwarded-proto": "https",
      },
    });

    expect(resolvePlatformUrl(request)).toBe("http://127.0.0.1:3000");
    expect(resolveConfiguredPlatformUrl()).toBe("http://localhost:3000");
  });

  it("prefers a valid configured public platform URL for oauth redirects", () => {
    process.env.DIFFAUDIT_PLATFORM_URL = "https://diffaudit.example.test";

    const request = new Request("http://127.0.0.1:3000/api/auth/google", {
      headers: {
        host: "127.0.0.1:3000",
      },
    });

    expect(resolvePlatformUrl(request)).toBe("https://diffaudit.example.test");
  });

  it("bootstraps the legacy shared account into the sqlite user store", async () => {
    process.env.DIFFAUDIT_SHARED_USERNAME = "example-reviewer";
    process.env.DIFFAUDIT_SHARED_PASSWORD = "ExamplePassword!2026";

    await ensureLegacySharedUser();

    await expect(
      verifyCredentials("example-reviewer", "ExamplePassword!2026"),
    ).resolves.toMatchObject({ username: "example-reviewer" });
  });

  it("updates the bootstrapped shared account when the env password changes", async () => {
    process.env.DIFFAUDIT_SHARED_USERNAME = "example-reviewer";
    process.env.DIFFAUDIT_SHARED_PASSWORD = "ExamplePassword!2026";
    await ensureLegacySharedUser();

    process.env.DIFFAUDIT_SHARED_PASSWORD = "ExamplePassword!2027";
    await ensureLegacySharedUser();

    await expect(
      verifyCredentials("example-reviewer", "ExamplePassword!2026"),
    ).resolves.toBeNull();
    await expect(
      verifyCredentials("example-reviewer", "ExamplePassword!2027"),
    ).resolves.toMatchObject({ username: "example-reviewer" });
  });
});
