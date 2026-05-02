"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { type Locale } from "@/components/language-picker";
import { NavIcon } from "@/components/platform-shell-icons";
import { getNavItems } from "@/lib/navigation";
import { findActiveNavItem } from "@/lib/platform-shell";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export function WorkspaceSidebar({ locale = "en-US" }: { locale?: Locale }) {
  const pathname = usePathname();
  const items = getNavItems(locale);
  const current = findActiveNavItem(pathname, items);
  const sidebarLabel = WORKSPACE_COPY[locale].shell.desktopNavAriaLabel;

  return (
    <nav className="flex flex-col gap-0.5" aria-label={sidebarLabel}>
      {items.map((item) => {
        const active = current.href === item.href;
        return (
        <Link
          key={item.href}
          href={item.href}
          prefetch={false}
          aria-current={active ? "page" : undefined}
          className={`workspace-sidebar-link ${active ? "is-active" : ""}`}
          title={item.subtitle}
          >
            <NavIcon icon={item.icon} />
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium leading-tight truncate">{item.title}</span>
              <span className="text-[10px] leading-tight text-muted-foreground/60 truncate">{item.subtitle}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
