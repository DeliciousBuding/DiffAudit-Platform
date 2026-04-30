"use client";

import { usePathname } from "next/navigation";

import { type Locale } from "@/components/language-picker";
import { getNavItems } from "@/lib/navigation";
import { findActiveNavItem } from "@/lib/platform-shell";

export function WorkspaceTopbarTitle({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const items = getNavItems(locale);
  const current = findActiveNavItem(pathname, items);
  const legacyTitle =
    pathname.startsWith("/workspace/account")
      ? (locale === "zh-CN" ? "账户" : "Account")
      : pathname.startsWith("/workspace/api-keys")
        ? (locale === "zh-CN" ? "API 密钥" : "API Keys")
        : pathname.startsWith("/workspace/settings")
          ? (locale === "zh-CN" ? "设置" : "Settings")
          : null;
  const title = legacyTitle ?? current.title;

  return (
    <div className="workspace-topbar-title" aria-label={title}>
      <span className="workspace-status-dot" aria-hidden="true" />
      <span>{title}</span>
    </div>
  );
}
