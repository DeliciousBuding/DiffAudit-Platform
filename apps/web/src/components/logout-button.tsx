"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";

type LogoutButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  label?: string;
};

const DEFAULT_CLASS_NAME =
  "inline-flex items-center justify-center rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/40 hover:text-foreground";

export function LogoutButton({
  label = "Sign out",
  className,
  onClick,
  ...buttonProps
}: LogoutButtonProps) {

  async function handleLogout(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  }

  return (
    <button
      {...buttonProps}
      type="button"
      onClick={handleLogout}
      className={className ? `${DEFAULT_CLASS_NAME} ${className}` : DEFAULT_CLASS_NAME}
    >
      {label}
    </button>
  );
}
