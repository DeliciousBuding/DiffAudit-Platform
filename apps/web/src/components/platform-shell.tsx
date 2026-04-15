import { headers } from "next/headers";

import { LanguagePicker } from "@/components/language-picker";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { BrandMark, GithubIcon } from "@/components/platform-shell-icons";
import { RuntimeStatusBadge } from "@/components/runtime-status-badge";
import { StatusBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export async function PlatformShell({ children }: { children: React.ReactNode }) {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[locale];

  return (
    <div className="workspace-layout">
      <aside className="workspace-sidebar">
        <div className="workspace-sidebar-header">
          <BrandMark />
        </div>
        <div className="workspace-sidebar-body">
          <WorkspaceSidebar locale={locale} />
        </div>
        <div className="workspace-sidebar-footer">
          <div className="flex items-center gap-2 px-3 py-2">
            <StatusBadge tone="info">{copy.shell.siteBadge}</StatusBadge>
          </div>
          <div className="flex items-center gap-1 px-3 pb-3">
            <RuntimeStatusBadge locale={locale} />
          </div>
        </div>
      </aside>

      <div className="workspace-main-area">
        <header className="workspace-topbar">
          <div className="flex items-center gap-2">
            <LanguagePicker value={locale} reloadOnChange />
            <a
              href="https://github.com/DeliciousBuding/DiffAudit-Platform"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground hover:border-[color:var(--accent-blue)]/40"
              title={copy.shell.githubTitle}
            >
              <GithubIcon />
            </a>
            <UserAvatar />
          </div>
        </header>
        <main className="workspace-main-content">{children}</main>
      </div>
    </div>
  );
}
