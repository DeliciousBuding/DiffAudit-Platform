import { describe, expect, it } from "vitest";

import {
  DEFAULT_REDIRECT_PATH,
  authPagePath,
  buildLoginPath,
  githubOAuthConfigured,
  googleOAuthConfigured,
  protectedApiPath,
  protectedPagePath,
  sanitizeRedirectPath,
} from "./auth-config";

describe("auth-config helpers", () => {
  it("classifies protected pages and API paths", () => {
    expect(protectedPagePath("/workspace")).toBe(true);
    expect(protectedPagePath("/workspace/audits")).toBe(true);
    expect(protectedPagePath("/")).toBe(false);
    expect(protectedApiPath("/api/v1/catalog")).toBe(true);
    expect(protectedApiPath("/api/auth/me")).toBe(false);
    expect(authPagePath("/login")).toBe(true);
    expect(authPagePath("/register")).toBe(true);
    expect(authPagePath("/workspace")).toBe(false);
  });

  it("sanitizes redirect paths, defaulting to the workspace fallback", () => {
    expect(sanitizeRedirectPath("/workspace/start")).toBe("/workspace/start");
    expect(sanitizeRedirectPath("//evil.example.com")).toBe(DEFAULT_REDIRECT_PATH);
    expect(sanitizeRedirectPath("javascript:alert(1)")).toBe(DEFAULT_REDIRECT_PATH);
    expect(sanitizeRedirectPath("")).toBe(DEFAULT_REDIRECT_PATH);
    expect(sanitizeRedirectPath(null, "/custom")).toBe("/custom");
  });

  it("builds a login URL preserving the safe redirect target", () => {
    expect(buildLoginPath("/workspace/start")).toBe("/login?redirectTo=%2Fworkspace%2Fstart");
    expect(buildLoginPath("//evil")).toBe("/login?redirectTo=%2Fworkspace");
  });

  it("detects provider configuration from VITE build-time flags", () => {
    import.meta.env.VITE_GITHUB_CLIENT_ID = "gh-x";
    import.meta.env.VITE_GOOGLE_CLIENT_ID = "go-x";
    expect(githubOAuthConfigured()).toBe(true);
    expect(googleOAuthConfigured()).toBe(true);
    expect(githubOAuthConfigured({ GITHUB_CLIENT_ID: "a", GITHUB_CLIENT_SECRET: "b" })).toBe(true);
    expect(googleOAuthConfigured({})).toBe(false);
  });
});
