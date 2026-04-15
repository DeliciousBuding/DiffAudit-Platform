"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type RegisterFormCopy = {
  username: string;
  email: string;
  emailPlaceholder: string;
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
  loginLink: string;
  loginCta: string;
  github: string;
};

export function RegisterForm({
  copy,
  pageCopy,
  oauthEnabled,
}: {
  copy: RegisterFormCopy;
  pageCopy: RegisterPageCopy;
  oauthEnabled: boolean;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  // Live password match validation
  const passwordsMatch = password === confirmPassword;
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch;

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
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? copy.error);
      setPending(false);
      return;
    }

    setPending(false);
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="grid gap-5">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <label className="caption" htmlFor="register-username">{copy.username}</label>
          <input id="register-username" className="portal-input h-[58px]" value={username} onChange={(event) => setUsername(event.target.value)} required />
        </div>
        <div className="grid gap-2">
          <label className="caption" htmlFor="register-email">{copy.email}</label>
          <input id="register-email" type="email" className="portal-input h-[58px]" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={copy.emailPlaceholder} required />
        </div>
        <div className="grid gap-2">
          <label className="caption" htmlFor="register-password">{copy.password}</label>
          <input id="register-password" type="password" className="portal-input h-[58px]" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={copy.passwordPlaceholder} required />
        </div>
        <div className="grid gap-2">
          <label className="caption" htmlFor="register-confirm-password">{copy.confirmPassword}</label>
          <input
            id="register-confirm-password"
            type="password"
            className={`portal-input h-[58px] ${showMismatch ? 'border-[var(--risk-high)] focus:border-[var(--risk-high)]' : ''}`}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder={copy.confirmPasswordPlaceholder}
            required
          />
          {showMismatch && (
            <p className="text-xs text-[var(--risk-high)] mt-1">{copy.passwordMismatch}</p>
          )}
        </div>
        <button type="submit" disabled={pending} className="portal-pill portal-pill-primary mt-2 h-[58px] w-full disabled:cursor-not-allowed disabled:opacity-55">
          {pending ? copy.pending : copy.submit}
        </button>
      </form>

      {oauthEnabled ? (
        <div className="grid gap-4">
          <div className="auth-divider">{pageCopy.oauthDivider}</div>
          <a href="/api/auth/github" className="auth-provider-button">
            {pageCopy.github}
          </a>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-[var(--risk-high)]">{error}</p>
      ) : (
        <p className="text-sm leading-7 text-muted-foreground">{copy.hint}</p>
      )}

      <p className="text-sm leading-7 text-muted-foreground">
        {pageCopy.loginLink} {" "}
        <Link href="/login" className="auth-inline-link">
          {pageCopy.loginCta}
        </Link>
      </p>
    </div>
  );
}
