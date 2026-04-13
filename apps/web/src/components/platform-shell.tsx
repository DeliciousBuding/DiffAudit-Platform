import { LogoutButton } from "@/components/logout-button";
import { PlatformNavDesktop, PlatformNavMobile } from "@/components/platform-nav.client";
import { BrandMark, GithubIcon } from "@/components/platform-shell-icons";

import { StatusBadge } from "@/components/status-badge";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="workspace-shell">
      <header className="workspace-header">
        <div className="container flex min-h-[78px] flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <BrandMark />
            <div className="hidden lg:block">
              <PlatformNavDesktop />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge tone="info">单站工作台</StatusBadge>
            <a
              href="https://github.com/DeliciousBuding/DiffAudit-Platform"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/80 text-muted-foreground transition hover:-translate-y-px hover:text-foreground"
              title="GitHub"
            >
              <GithubIcon />
            </a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container workspace-main">{children}</main>
      <PlatformNavMobile />
    </div>
  );
}
