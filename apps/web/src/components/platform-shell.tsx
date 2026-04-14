import { headers } from "next/headers";

import { LanguagePicker } from "@/components/language-picker";
import { LogoutButton } from "@/components/logout-button";
import { PlatformNavDesktop, PlatformNavMobile } from "@/components/platform-nav.client";
import { BrandMark, GithubIcon } from "@/components/platform-shell-icons";
import { StatusBadge } from "@/components/status-badge";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export async function PlatformShell({ children }: { children: React.ReactNode }) {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[locale];

  return (
    <div className="workspace-shell">
      <header className="workspace-header">
        <div className="container flex min-h-[78px] flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <BrandMark />
            <div className="hidden lg:block">
              <PlatformNavDesktop locale={locale} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge tone="info">{copy.shell.siteBadge}</StatusBadge>
            <LanguagePicker value={locale} reloadOnChange />
            <a
              href="https://github.com/DeliciousBuding/DiffAudit-Platform"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/80 text-muted-foreground transition hover:-translate-y-px hover:text-foreground"
              title={copy.shell.githubTitle}
            >
              <GithubIcon />
            </a>
            <LogoutButton label={copy.shell.signOut} />
          </div>
        </div>
      </header>

      <main className="container workspace-main">{children}</main>
      <PlatformNavMobile locale={locale} />
    </div>
  );
}
