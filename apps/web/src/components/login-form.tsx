"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      setError(payload?.message ?? "登录失败，请检查共享账号密码。");
      setPending(false);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="username">
          共享账号
        </label>
        <input
          id="username"
          className="w-full rounded-2xl border border-input bg-white/70 px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 dark:bg-[hsl(220_13%_14%/0.88)]"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
          placeholder="diffaudit-review"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="password">
          共享密码
        </label>
        <input
          id="password"
          type="password"
          className="w-full rounded-2xl border border-input bg-white/70 px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 dark:bg-[hsl(220_13%_14%/0.88)]"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          placeholder="DiffAuditTemp!2026"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-px hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "验证中..." : "进入平台"}
      </button>
    </form>
  );
}
