"use client";

export function LogoutButton({ label = "Sign out" }: { label?: string }) {
  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
    >
      {label}
    </button>
  );
}
