"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { type Locale } from "@/components/language-picker";
import { getNavItems } from "@/lib/navigation";
import { findActiveNavItem } from "@/lib/platform-shell";

function SidebarIcon({ icon }: { icon: "spark" | "dashboard" | "report" | "settings" }) {
  const cls = "h-4 w-4 flex-shrink-0";

  if (icon === "spark") {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
        <path d="M18.5 15.5 20 19l-3.5-1.5L15 14l3.5 1.5Z" />
        <path d="M7 15.2 8 18l-2.8-1-1-2.8 2.8 1Z" />
      </svg>
    );
  }

  if (icon === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3.5" y="4" width="7.5" height="7.5" rx="1.8" />
        <rect x="13" y="4" width="7.5" height="4.5" rx="1.8" />
        <rect x="13" y="10.5" width="7.5" height="9.5" rx="1.8" />
        <rect x="3.5" y="13.5" width="7.5" height="6.5" rx="1.8" />
      </svg>
    );
  }

  if (icon === "report") {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M7 3.5h8l4 4V19a1.8 1.8 0 0 1-1.8 1.8H7A1.8 1.8 0 0 1 5.2 19V5.3A1.8 1.8 0 0 1 7 3.5Z" />
        <path d="M15 3.8V8h4.2" />
        <path d="M8.5 12h7" />
        <path d="M8.5 15.5h7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 3.8a3.2 3.2 0 1 1 0 6.4a3.2 3.2 0 0 1 0-6.4Z" />
      <path d="M4.5 19.2c1.8-3.1 4.3-4.6 7.5-4.6s5.7 1.5 7.5 4.6" />
    </svg>
  );
}

export function WorkspaceSidebar({ locale = "en-US" }: { locale?: Locale }) {
  const pathname = usePathname();
  const items = getNavItems(locale);
  const current = findActiveNavItem(pathname);

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Sidebar navigation">
      {items.map((item) => {
        const active = current.href === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`workspace-sidebar-link ${active ? "is-active" : ""}`}
            title={item.subtitle}
          >
            <SidebarIcon icon={item.icon} />
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
