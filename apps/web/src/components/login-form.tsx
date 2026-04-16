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
  const [showPasswordForm, setShowPasswordForm] = useState(!oauthEnabled.google && !oauthEnabled.github);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  return (
    <div className="grid gap-5">
      {(oauthEnabled.google || oauthEnabled.github) ? (
        <div className="grid gap-3">
          {oauthEnabled.google ? (
            <a
              href={`/api/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`}
              className="auth-provider-button"
            >
              <span className="auth-provider-icon"><ProviderIcon provider="google" /></span>
              <span className="auth-provider-label">{pageCopy.google}</span>
            </a>
          ) : null}
          {oauthEnabled.github ? (
            <a
              href={`/api/auth/github?redirectTo=${encodeURIComponent(redirectTo)}`}
              className="auth-provider-button"
            >
              <span className="auth-provider-icon text-[#121317] dark:text-white"><ProviderIcon provider="github" /></span>
              <span className="auth-provider-label">{pageCopy.github}</span>
            </a>
          ) : null}
          <p className="text-sm leading-7 text-muted-foreground">{pageCopy.providerHint}</p>
        </div>
      ) : null}

      {!showPasswordForm ? (
        <button
          type="button"
          onClick={() => setShowPasswordForm(true)}
          className="auth-password-reveal btn-quiet"
        >
          {pageCopy.passwordDivider}
        </button>
      ) : (
        <form className="grid gap-5 rounded-[20px] border border-border bg-muted/10 p-4" onSubmit={handleSubmit}>
          <div className="auth-divider">{pageCopy.passwordDivider}</div>
          <div className="grid gap-2">
            <label className="caption" htmlFor="login-username">
              {copy.username}
            </label>
            <div className="auth-input-shell">
              <span className="auth-input-icon"><InputIcon icon="user" /></span>
              <input
                id="login-username"
                className="portal-input auth-input-field h-[58px]"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder={copy.username}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="caption" htmlFor="login-password">
              {copy.password}
            </label>
            <div className="auth-input-shell">
              <span className="auth-input-icon"><InputIcon icon="lock" /></span>
              <input
                id="login-password"
                type="password"
                className="portal-input auth-input-field h-[58px]"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder={copy.passwordPlaceholder}
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="portal-pill mt-2 h-[58px] flex-1 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {pending ? copy.pending : copy.submit}
            </button>
            {(oauthEnabled.google || oauthEnabled.github) ? (
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="btn-quiet mt-2 rounded-[16px] border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
              >
                {pageCopy.hidePasswordCta}
              </button>
            ) : null}
          </div>
        </form>
      )}

      {error ? (
        <p className="text-sm text-[#bf2f2f]">{error}</p>
      ) : oauthError ? (
        <p className="text-sm text-[#bf2f2f]">{copy.error}</p>
      ) : (
        <p className="text-sm leading-7 text-muted-foreground">{copy.hint}</p>
      )}

      <p className="text-sm leading-7 text-muted-foreground">
        {pageCopy.registerLink} {" "}
        <Link
          href={`/register?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="auth-inline-link"
        >
          {pageCopy.registerCta}
        </Link>
      </p>

      <p className="text-xs leading-6 text-muted-foreground">
        {pageCopy.legalPrefix}{" "}
        <Link href="/docs/privacy" className="auth-inline-link">{pageCopy.privacy}</Link>
        {" · "}
        <Link href="/docs/terms" className="auth-inline-link">{pageCopy.terms}</Link>
      </p>
    </div>
  );
}
