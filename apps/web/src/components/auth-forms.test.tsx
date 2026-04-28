import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

let searchParamsValue = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(searchParamsValue),
}));

describe("auth forms", () => {
  const loginCopy = {
    username: "Username",
    password: "Password",
    passwordPlaceholder: "Enter password",
    submit: "Sign in",
    pending: "Signing in...",
    hint: "Hint",
    error: "Error",
    oauthErrors: {
      state: "State expired",
      config: "OAuth unavailable",
      networkGoogle: "Google unavailable",
      networkGithub: "GitHub unavailable",
      token: "Token failed",
      user: "User failed",
      fallback: "OAuth failed",
    },
    validation: {
      usernameRequired: "Username is required",
      passwordRequired: "Password is required",
    },
  } as const;

  const loginPageCopy = {
    oauthDivider: "Or continue with",
    passwordDivider: "Use password instead",
    hidePasswordCta: "Hide password sign-in",
    registerLink: "New?",
    registerCta: "Create account",
    providerHint: "Provider hint",
    google: "Continue with Google",
    github: "Continue with GitHub",
    privacy: "Privacy Policy",
    terms: "Terms",
    legalPrefix: "By continuing, you agree to the",
  } as const;

  const registerCopy = {
    username: "Username",
    password: "Password",
    passwordPlaceholder: "At least 8 characters",
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Confirm password",
    submit: "Save password access",
    pending: "Saving...",
    hint: "Fallback access",
    error: "Error",
    passwordMismatch: "Mismatch",
    validation: {
      usernameRequired: "Username is required",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 8 characters",
      confirmPasswordRequired: "Please confirm your password",
    },
  } as const;

  const registerPageCopy = {
    oauthDivider: "Or continue with",
    passwordDivider: "Or set a password",
    loginLink: "Already have an account?",
    loginCta: "Sign in",
    providerHint: "Provider hint",
    google: "Continue with Google",
    github: "Continue with GitHub",
    privacy: "Privacy Policy",
    terms: "Terms",
    legalPrefix: "Access is governed by the",
  } as const;

  it("renders provider-first login actions with icons and legal links", () => {
    searchParamsValue = "";
    const markup = renderToStaticMarkup(
      <LoginForm
        redirectTo="/workspace"
        oauthEnabled={{ google: true, github: true }}
        copy={loginCopy}
        pageCopy={loginPageCopy}
      />,
    );

    expect(markup).toContain("Continue with Google");
    expect(markup).toContain("Continue with GitHub");
    expect(markup).toContain("Sign in");
    expect(markup).toContain("/docs/privacy");
    expect(markup).toContain("/docs/terms");
    expect(markup).toContain("auth-provider-icon");
    expect(markup).toContain("/register?redirectTo=%2Fworkspace");
    expect(markup).toContain('noValidate=""');
  });

  it("hides login providers when oauth is unavailable", () => {
    searchParamsValue = "";
    const markup = renderToStaticMarkup(
      <LoginForm
        redirectTo="/workspace"
        oauthEnabled={{ google: false, github: false }}
        copy={loginCopy}
        pageCopy={loginPageCopy}
      />,
    );

    expect(markup).not.toContain("Continue with Google");
    expect(markup).not.toContain("Continue with GitHub");
    expect(markup).toContain('noValidate=""');
  });

  it("preserves redirectTo through the local account path", () => {
    searchParamsValue = "";
    const markup = renderToStaticMarkup(
      <RegisterForm
        redirectTo="/workspace/reports"
        copy={registerCopy}
        pageCopy={registerPageCopy}
      />,
    );

    expect(markup).not.toContain("Continue with Google");
    expect(markup).not.toContain("Continue with GitHub");
    expect(markup).toContain("Save password access");
    expect(markup).toContain("auth-input-icon");
    expect(markup).toContain("/login?redirectTo=%2Fworkspace%2Freports");
    expect(markup).toContain('noValidate=""');
  });

  it("renders provider-specific OAuth callback errors instead of password-login copy", () => {
    searchParamsValue = "error=oauth_network_google";
    const markup = renderToStaticMarkup(
      <LoginForm
        redirectTo="/workspace"
        oauthEnabled={{ google: true, github: true }}
        copy={loginCopy}
        pageCopy={loginPageCopy}
      />,
    );

    expect(markup).toContain("Google unavailable");
    expect(markup).not.toContain(">Error<");
  });
});
