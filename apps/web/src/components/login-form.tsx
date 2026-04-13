"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({
  usernameHint,
  redirectTo,
}: {
  usernameHint: string;
  redirectTo: string;
}) {
  const router = useRouter();
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
      setError(payload?.message ?? "登录失败，请检查共享账户信息。");
      setPending(false);
      return;
    }

    setPending(false);
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="caption" htmlFor="shared-username">
          共享账号
        </label>
        <input
          id="shared-username"
          className="portal-input h-[58px]"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          placeholder={usernameHint}
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="caption" htmlFor="shared-password">
          共享密码
        </label>
        <input
          id="shared-password"
          type="password"
          className="portal-input h-[58px]"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="输入共享密码"
          required
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="portal-pill portal-pill-primary mt-2 h-[58px] w-full disabled:cursor-not-allowed disabled:opacity-55"
      >
        {pending ? "登录中..." : "进入工作台"}
      </button>

      {error ? (
        <p className="text-sm text-[#bf2f2f]">{error}</p>
      ) : (
        <p className="text-sm leading-7 text-muted-foreground">
          登录后将直接进入统一工作台。
        </p>
      )}
    </form>
  );
}
