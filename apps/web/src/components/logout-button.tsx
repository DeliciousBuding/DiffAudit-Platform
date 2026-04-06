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
      className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] text-[var(--muted)] transition hover:border-[rgba(255,255,255,0.18)] hover:text-[var(--foreground)]"
    >
      退出共享会话
    </button>
  );
}
