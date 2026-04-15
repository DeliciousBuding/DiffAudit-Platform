"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ label = "Sign out" }: { label?: string }) {
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
      className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
    >
      {label}
    </button>
  );
}
