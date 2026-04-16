"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { InputIcon } from "@/components/auth-icons";

type RegisterFormCopy = {
  username: string;
  password: string;
  passwordPlaceholder: string;
  confirmPassword: string;
  confirmPasswordPlaceholder: string;
  submit: string;
  pending: string;
  hint: string;
  error: string;
  passwordMismatch: string;
};

type RegisterPageCopy = {
  oauthDivider: string;
  passwordDivider: string;
  loginLink: string;
  loginCta: string;
  providerHint: string;
  google: string;
  github: string;
  privacy: string;
  terms: string;
  legalPrefix: string;
};

export function RegisterForm({
  redirectTo,
  copy,
  pageCopy,
  oauthEnabled,
}: {
  redirectTo: string;
  copy: RegisterFormCopy;
  pageCopy: RegisterPageCopy;
  oauthEnabled: { google: boolean; github: boolean };
}) {
  const router = useRouter();
  const hasOauthOption = oauthEnabled.google || oauthEnabled.github;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    setPending(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password, redirectTo }),
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

  return (
    <div className="grid gap-5">
      <form className="grid gap-5 rounded-[20px] border border-border bg-muted/10 p-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <label className="caption" htmlFor="register-username">{copy.username}</label>
          <div className="auth-input-shell">
            <span className="auth-input-icon"><InputIcon icon="user" /></span>
            <input id="register-username" className="portal-input auth-input-field h-[58px]" value={username} onChange={(event) => setUsername(event.target.value)} required />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="caption" htmlFor="register-password">{copy.password}</label>
          <div className="auth-input-shell">
            <span className="auth-input-icon"><InputIcon icon="lock" /></span>
            <input id="register-password" type="password" className="portal-input auth-input-field h-[58px]" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={copy.passwordPlaceholder} required />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="caption" htmlFor="register-confirm-password">{copy.confirmPassword}</label>
          <div className="auth-input-shell">
            <span className="auth-input-icon"><InputIcon icon="shield" /></span>
            <input id="register-confirm-password" type="password" className="portal-input auth-input-field h-[58px]" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder={copy.confirmPasswordPlaceholder} required />
          </div>
        </div>
        <button type="submit" disabled={pending} className="portal-pill mt-2 h-[58px] w-full disabled:cursor-not-allowed disabled:opacity-55">
          {pending ? copy.pending : copy.submit}
        </button>
      </form>

      {error ? (
        <p className="text-sm text-[#bf2f2f]">{error}</p>
      ) : (
        <p className="text-sm leading-7 text-muted-foreground">{copy.hint}</p>
      )}

      {hasOauthOption ? (
        <p className="text-sm leading-7 text-muted-foreground">{pageCopy.providerHint}</p>
      ) : null}

      <p className="text-sm leading-7 text-muted-foreground">
        {pageCopy.loginLink} {" "}
        <Link
          href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="auth-inline-link"
        >
          {pageCopy.loginCta}
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
