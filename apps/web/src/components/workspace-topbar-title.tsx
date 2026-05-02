"use client";

import { usePathname } from "next/navigation";

import { type Locale } from "@/components/language-picker";
import { getNavItems } from "@/lib/navigation";
import { findActiveNavItem } from "@/lib/platform-shell";

export function WorkspaceTopbarTitle({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const items = getNavItems(locale);
  const current = findActiveNavItem(pathname, items);

  return (
    <div className="workspace-topbar-title" aria-label={current.title}>
      <span className="workspace-status-dot" aria-hidden="true" />
      <span>{current.title}</span>
    </div>
  );
}
