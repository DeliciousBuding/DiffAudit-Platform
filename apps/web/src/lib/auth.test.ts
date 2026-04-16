import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { eq } from "drizzle-orm";
import OTPAuth from "otpauth";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_REDIRECT_PATH,
  authPagePath,
  beginTwoFactorSetup,
  createEmailVerificationRequest,
  createSession,
  createUser,
  disableTwoFactor,
  enableTwoFactor,
  ensureLegacySharedUser,
  buildLoginPath,
  findOrCreateOAuthUser,
  getCurrentUserProfile,
  googleOAuthConfigured,
  githubOAuthConfigured,
  linkOAuthAccount,
  protectedApiPath,
  protectedPagePath,
  sanitizeRedirectPath,
  setPendingEmail,
  verifyEmailToken,
  verifyCredentials,
} from "./auth";
import { getDb, resetDbForTests, schema } from "./db";

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

  it("supports password login with username or verified email", async () => {
    const user = await createUser("delicious233", "hello@diffaudit.test", "DiffAuditTemp!2026");
    const db = getDb();
    db.update(schema.users)
      .set({
        email: "hello@diffaudit.test",
        pendingEmail: null,
        emailVerified: true,
      })
      .where(eq(schema.users.id, user.id))
      .run();

    await expect(
      verifyCredentials("delicious233", "DiffAuditTemp!2026"),
    ).resolves.toMatchObject({ username: "delicious233" });
    await expect(
      verifyCredentials("hello@diffaudit.test", "DiffAuditTemp!2026"),
    ).resolves.toMatchObject({ username: "delicious233" });
  });

  it("does not auto-merge verified oauth identities into an unverified local email owner", async () => {
    const existing = await createUser("delicious233", "hello@diffaudit.test", "DiffAuditTemp!2026");

    const oauthUser = findOrCreateOAuthUser("google", "google-sub-1", {
      username: "delicious233-google",
      displayName: "Delicious 233",
      email: "hello@diffaudit.test",
      emailVerified: true,
      avatarUrl: "https://example.test/avatar.png",
    });

    expect(oauthUser.id).not.toBe(existing.id);
  });

  it("merges verified oauth identities into an existing verified email owner", async () => {
    const existing = await createUser("delicious233", "hello@diffaudit.test", "DiffAuditTemp!2026");
    const db = getDb();
    db.update(schema.users)
      .set({
        email: "hello@diffaudit.test",
        pendingEmail: null,
        emailVerified: true,
      })
      .where(eq(schema.users.id, existing.id))
      .run();

    const oauthUser = findOrCreateOAuthUser("google", "google-sub-1", {
      username: "delicious233-google",
      displayName: "Delicious 233",
      email: "hello@diffaudit.test",
      emailVerified: true,
      avatarUrl: "https://example.test/avatar.png",
    });

    expect(oauthUser.id).toBe(existing.id);

    const token = createSession(existing.id);
    expect(getCurrentUserProfile(token)).toMatchObject({
      id: existing.id,
      username: "delicious233",
      displayName: "Delicious 233",
      email: "hello@diffaudit.test",
      emailVerified: true,
      avatarUrl: "https://example.test/avatar.png",
      providers: ["google"],
      hasPassword: true,
    });
  });

  it("creates a new oauth user when no verified email match exists", () => {
    const oauthUser = findOrCreateOAuthUser("github", "github-id-1", {
      username: "delicious233",
      displayName: "Delicious Buding",
      email: "new@diffaudit.test",
      emailVerified: false,
      avatarUrl: "https://example.test/github.png",
    });

    const token = createSession(oauthUser.id);
    expect(getCurrentUserProfile(token)).toMatchObject({
      id: oauthUser.id,
      displayName: "Delicious Buding",
      email: null,
      pendingEmail: "new@diffaudit.test",
      emailVerified: false,
      avatarUrl: "https://example.test/github.png",
      providers: ["github"],
      hasPassword: false,
    });
  });

  it("promotes pendingEmail to canonical email after successful verification", async () => {
    const user = await createUser("delicious233", null, "DiffAuditTemp!2026");
    const db = getDb();
    db.update(schema.users)
      .set({
        pendingEmail: "verify@diffaudit.test",
        email: null,
        emailVerified: false,
      })
      .where(eq(schema.users.id, user.id))
      .run();

    const request = createEmailVerificationRequest(user.id, "https://diffaudit.vectorcontrol.tech");
    expect(request).not.toBeNull();
    expect(request?.email).toBe("verify@diffaudit.test");
    expect(request?.verificationUrl).toContain("/api/auth/verify-email?token=");

    const result = verifyEmailToken(request!.token);
    expect(result).toEqual({
      ok: true,
      userId: user.id,
      email: "verify@diffaudit.test",
    });

    expect(getCurrentUserProfile(createSession(user.id))).toMatchObject({
      email: "verify@diffaudit.test",
      pendingEmail: null,
      emailVerified: true,
    });
  });

  it("stores a pending email without replacing the current verified email", async () => {
    const user = await createUser("delicious233", null, "DiffAuditTemp!2026");
    const db = getDb();
    db.update(schema.users)
      .set({
        email: "current@diffaudit.test",
        pendingEmail: null,
        emailVerified: true,
      })
      .where(eq(schema.users.id, user.id))
      .run();

    expect(setPendingEmail(user.id, "next@diffaudit.test")).toEqual({
      ok: true,
      pendingEmail: "next@diffaudit.test",
    });

    expect(getCurrentUserProfile(createSession(user.id))).toMatchObject({
      email: "current@diffaudit.test",
      pendingEmail: "next@diffaudit.test",
      emailVerified: true,
    });
  });

  it("rejects pending emails already claimed as a verified canonical email", async () => {
    const existing = await createUser("claimed", null, "DiffAuditTemp!2026");
    const local = await createUser("delicious233", null, "DiffAuditTemp!2026");
    const db = getDb();
    db.update(schema.users)
      .set({
        email: "claimed@diffaudit.test",
        pendingEmail: null,
        emailVerified: true,
      })
      .where(eq(schema.users.id, existing.id))
      .run();

    expect(setPendingEmail(local.id, "claimed@diffaudit.test")).toEqual({
      ok: false,
      reason: "email_in_use",
    });
  });

  it("links a new oauth provider to an existing local account", async () => {
    const user = await createUser("delicious233", null, "DiffAuditTemp!2026");

    expect(linkOAuthAccount(user.id, "google", "google-sub-1", {
      username: "delicious233-google",
      displayName: "Delicious 233",
      email: "verify@diffaudit.test",
      emailVerified: true,
      avatarUrl: "https://example.test/avatar.png",
    })).toEqual({
      ok: true,
      userId: user.id,
      status: "linked",
    });

    expect(getCurrentUserProfile(createSession(user.id))).toMatchObject({
      id: user.id,
      displayName: "Delicious 233",
      email: "verify@diffaudit.test",
      emailVerified: true,
      providers: ["google"],
    });
  });

  it("rejects linking a provider account that belongs to another user", async () => {
    const first = await createUser("first", null, "DiffAuditTemp!2026");
    const second = await createUser("second", null, "DiffAuditTemp!2026");

    expect(linkOAuthAccount(first.id, "github", "gh-1", {
      username: "first",
      displayName: "First",
      email: null,
      emailVerified: false,
      avatarUrl: null,
    })).toEqual({
      ok: true,
      userId: first.id,
      status: "linked",
    });

    expect(linkOAuthAccount(second.id, "github", "gh-1", {
      username: "second",
      displayName: "Second",
      email: null,
      emailVerified: false,
      avatarUrl: null,
    })).toEqual({
      ok: false,
      reason: "provider_in_use",
    });
  });

  it("rejects linking a second account for the same provider", async () => {
    const user = await createUser("delicious233", null, "DiffAuditTemp!2026");

    expect(linkOAuthAccount(user.id, "google", "google-sub-1", {
      username: "delicious233-google",
      displayName: "Delicious 233",
      email: null,
      emailVerified: false,
      avatarUrl: null,
    })).toEqual({
      ok: true,
      userId: user.id,
      status: "linked",
    });

    expect(linkOAuthAccount(user.id, "google", "google-sub-2", {
      username: "delicious233-google-2",
      displayName: "Delicious 233",
      email: null,
      emailVerified: false,
      avatarUrl: null,
    })).toEqual({
      ok: false,
      reason: "provider_already_connected",
    });
  });

  it("rejects invalid verification tokens without promoting email", async () => {
    const user = await createUser("delicious233", null, "DiffAuditTemp!2026");
    const db = getDb();
    db.update(schema.users)
      .set({
        pendingEmail: "verify@diffaudit.test",
        email: null,
        emailVerified: false,
      })
      .where(eq(schema.users.id, user.id))
      .run();

    expect(verifyEmailToken("bad-token")).toEqual({
      ok: false,
      reason: "invalid",
    });

    expect(getCurrentUserProfile(createSession(user.id))).toMatchObject({
      email: null,
      pendingEmail: "verify@diffaudit.test",
      emailVerified: false,
    });
  });

  it("starts a TOTP 2FA setup and exposes the secret through the current profile state", async () => {
    const user = await createUser("delicious233", null, "DiffAuditTemp!2026");

    const setup = beginTwoFactorSetup(user.id, "DiffAudit", "delicious233");
    expect(setup.secret).toHaveLength(32);
    expect(setup.otpauthUrl).toContain("otpauth://totp/");
    expect(setup.otpauthUrl).toContain("DiffAudit");

    expect(getCurrentUserProfile(createSession(user.id))).toMatchObject({
      twoFactorEnabled: false,
    });
  });

  it("enables TOTP 2FA with a valid code and returns recovery codes", async () => {
    const user = await createUser("delicious233", null, "DiffAuditTemp!2026");
    const setup = beginTwoFactorSetup(user.id, "DiffAudit", "delicious233");
    const totp = new OTPAuth.TOTP({
      issuer: "DiffAudit",
      label: "delicious233",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(setup.secret),
    });
    const code = totp.generate();

    const result = enableTwoFactor(user.id, code);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.recoveryCodes).toHaveLength(8);
      expect(result.recoveryCodes[0]).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    }

    expect(getCurrentUserProfile(createSession(user.id))).toMatchObject({
      twoFactorEnabled: true,
    });
  });

  it("rejects invalid TOTP codes when enabling 2FA", async () => {
    const user = await createUser("delicious233", null, "DiffAuditTemp!2026");
    beginTwoFactorSetup(user.id, "DiffAudit", "delicious233");

    expect(enableTwoFactor(user.id, "000000")).toEqual({
      ok: false,
      reason: "invalid_code",
    });
  });

  it("disables TOTP 2FA and clears the enabled status", async () => {
    const user = await createUser("delicious233", null, "DiffAuditTemp!2026");
    const setup = beginTwoFactorSetup(user.id, "DiffAudit", "delicious233");
    const totp = new OTPAuth.TOTP({
      issuer: "DiffAudit",
      label: "delicious233",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(setup.secret),
    });
    enableTwoFactor(user.id, totp.generate());

    expect(disableTwoFactor(user.id)).toEqual({ ok: true });
    expect(getCurrentUserProfile(createSession(user.id))).toMatchObject({
      twoFactorEnabled: false,
    });
  });
});
