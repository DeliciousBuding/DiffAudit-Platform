"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  registerLink: string;
  registerCta: string;
  github: string;
};

export function LoginForm({
  redirectTo,
  copy,
  pageCopy,
}: {
  redirectTo: string;
  copy: LoginFormCopy;
  pageCopy: LoginPageCopy;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

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
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <label className="caption" htmlFor="login-username">
            {copy.username}
          </label>
          <input
            id="login-username"
            className="portal-input h-[58px]"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            placeholder={copy.username}
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="caption" htmlFor="login-password">
            {copy.password}
          </label>
          <input
            id="login-password"
            type="password"
            className="portal-input h-[58px]"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder={copy.passwordPlaceholder}
            required
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="portal-pill portal-pill-primary mt-2 h-[58px] w-full disabled:cursor-not-allowed disabled:opacity-55"
        >
          {pending ? copy.pending : copy.submit}
        </button>
      </form>

      <div className="grid gap-4">
        <div className="auth-divider">{pageCopy.oauthDivider}</div>
        <a href="/api/auth/github" className="auth-provider-button">
          {pageCopy.github}
        </a>
      </div>

      {error ? (
        <p className="text-sm text-[#bf2f2f]">{error}</p>
      ) : oauthError ? (
        <p className="text-sm text-[#bf2f2f]">{copy.error}</p>
      ) : (
        <p className="text-sm leading-7 text-muted-foreground">{copy.hint}</p>
      )}

      <p className="text-sm leading-7 text-muted-foreground">
        {pageCopy.registerLink} {" "}
        <Link href="/register" className="auth-inline-link">
          {pageCopy.registerCta}
        </Link>
      </p>
    </div>
  );
}
