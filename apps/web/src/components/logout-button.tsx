"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center justify-center rounded-xl border border-border bg-white/55 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition hover:-translate-y-px hover:text-foreground dark:bg-white/5"
    >
      退出共享会话
    </button>
  );
}
