"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { InputIcon, ProviderIcon } from "@/components/auth-icons";

type LoginFormCopy = {
  username: string;
  password: string;
  passwordPlaceholder: string;
  submit: string;
  pending: string;
  hint: string;
  error: string;
  validation: {
    usernameRequired: string;
    passwordRequired: string;
  };
};

type LoginPageCopy = {
  oauthDivider: string;
  passwordDivider: string;
  hidePasswordCta: string;
  registerLink: string;
  registerCta: string;
  providerHint: string;
  google: string;
  github: string;
  privacy: string;
  terms: string;
  legalPrefix: string;
};

export function LoginForm({
  redirectTo,
  copy,
  pageCopy,
  oauthEnabled,
}: {
  redirectTo: string;
  copy: LoginFormCopy;
  pageCopy: LoginPageCopy;
  oauthEnabled: { google: boolean; github: boolean };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  function validateUsername(value: string) {
    return value.trim() ? "" : copy.validation.usernameRequired;
  }

  function validatePassword(value: string) {
    return value ? "" : copy.validation.passwordRequired;
  }

  function handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setUsername(value);
    setValidationErrors((current) => ({
      ...current,
      username: validateUsername(value) || undefined,
    }));
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setPassword(value);
    setValidationErrors((current) => ({
      ...current,
      password: validatePassword(value) || undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    if (usernameError || passwordError) {
      setValidationErrors({
        username: usernameError || undefined,
        password: passwordError || undefined,
      });
      return;
    }

    setPending(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? copy.error);
      setPending(false);
      return;
    }

    setPending(false);
    router.replace(redirectTo);
    router.refresh();
  }

  const oauthError = searchParams.get("error");
  const showProviderButtons = oauthEnabled.google || oauthEnabled.github;

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error ? (
          <div className="rounded-lg bg-risk-high-bg p-3 text-sm text-risk-high">
            {error}
          </div>
        ) : oauthError ? (
          <div className="rounded-lg bg-risk-high-bg p-3 text-sm text-risk-high">
            {copy.error}
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <label className="text-[13px] font-medium text-foreground" htmlFor="login-username">
              {copy.username}
            </label>
            <div className="auth-input-shell">
              <span className="auth-input-icon text-muted-foreground"><InputIcon icon="user" /></span>
              <input
                id="login-username"
                className={`portal-input auth-input-field h-[48px] text-[15px] ${validationErrors.username ? "border-risk-high" : ""}`}
                value={username}
                onChange={handleUsernameChange}
                autoComplete="username"
                placeholder={copy.username}
                required
              />
              {validationErrors.username ? (
                <p className="mt-1 text-xs text-risk-high">{validationErrors.username}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="text-[13px] font-medium text-foreground" htmlFor="login-password">
              {copy.password}
            </label>
            <div className="auth-input-shell">
              <span className="auth-input-icon text-muted-foreground"><InputIcon icon="lock" /></span>
              <input
                id="login-password"
                type="password"
                className={`portal-input auth-input-field h-[48px] text-[15px] ${validationErrors.password ? "border-risk-high" : ""}`}
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
                placeholder={copy.passwordPlaceholder}
                required
              />
              {validationErrors.password ? (
                <p className="mt-1 text-xs text-risk-high">{validationErrors.password}</p>
              ) : null}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="hero-button-primary flex h-[48px] items-center justify-center rounded-[14px] text-[15px] font-medium shadow-sm transition-all hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? copy.pending : copy.submit}
        </button>

        {showProviderButtons ? (
          <div className="mt-4 flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {oauthEnabled.google ? (
                <a
                  href={`/api/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`}
                  className="auth-provider-button transition-transform"
                >
                  <span className="auth-provider-icon"><ProviderIcon provider="google" /></span>
                  <span className="auth-provider-label text-[14.5px] font-medium">{pageCopy.google}</span>
                </a>
              ) : (
                <span className="auth-provider-button is-disabled" aria-disabled="true" title="Google OAuth is not configured">
                  <span className="auth-provider-icon"><ProviderIcon provider="google" /></span>
                  <span className="auth-provider-label text-[14.5px] font-medium">{pageCopy.google}</span>
                </span>
              )}
              {oauthEnabled.github ? (
                <a
                  href={`/api/auth/github?redirectTo=${encodeURIComponent(redirectTo)}`}
                  className="auth-provider-button transition-transform text-[#121317] dark:text-white"
                >
                  <span className="auth-provider-icon text-[#121317] dark:text-white"><ProviderIcon provider="github" /></span>
                  <span className="auth-provider-label text-[14.5px] font-medium">{pageCopy.github}</span>
                </a>
              ) : (
                <span className="auth-provider-button is-disabled text-[#121317] dark:text-white" aria-disabled="true" title="GitHub OAuth is not configured">
                  <span className="auth-provider-icon text-[#121317] dark:text-white"><ProviderIcon provider="github" /></span>
                  <span className="auth-provider-label text-[14.5px] font-medium">{pageCopy.github}</span>
                </span>
              )}
            </div>
          </div>
        ) : null}
      </form>

      <div className="flex flex-col items-center gap-4 2xl:gap-6 mt-8 2xl:mt-12">
        {!error && !oauthError ? (
          <p className="text-[16px] 2xl:text-[18px] text-muted-foreground">
            {copy.hint}
          </p>
        ) : null}
        <p className="text-[16px] 2xl:text-[18px] text-muted-foreground">
          {pageCopy.registerLink}{" "}
          <Link href={`/register?redirectTo=${encodeURIComponent(redirectTo)}`} className="text-foreground font-medium transition-colors hover:underline underline-offset-4">
            {pageCopy.registerCta}
          </Link>
        </p>
        <p className="text-center text-[14.5px] 2xl:text-[16px] leading-relaxed text-muted-foreground/60">
          {pageCopy.legalPrefix}{" "}
          <Link href="/docs/privacy" className="font-medium transition-colors hover:text-foreground">{pageCopy.privacy}</Link>
          {" · "}
          <Link href="/docs/terms" className="font-medium transition-colors hover:text-foreground">{pageCopy.terms}</Link>
        </p>
      </div>
    </div>
  );
}
