import { headers } from "next/headers";

import { LanguagePicker } from "@/components/language-picker";
import { LogoutButton } from "@/components/logout-button";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { BrandMark, GithubIcon } from "@/components/platform-shell-icons";
import { RuntimeStatusBadge } from "@/components/runtime-status-badge";
import { StatusBadge } from "@/components/status-badge";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
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
          <div className="header-controls flex items-center gap-2">
            <ThemeToggleButton />
            <LanguagePicker value={locale} reloadOnChange compact />
            <a
              href="https://github.com/DeliciousBuding/DiffAudit-Research"
              target="_blank"
              rel="noreferrer"
              className="header-pill header-pill-icon text-muted-foreground hover:text-foreground"
              title={copy.shell.githubTitle}
            >
              <GithubIcon />
            </a>
            <LogoutButton
              label={copy.shell.signOut}
              className="header-pill header-pill-primary !h-[38px] !px-4 text-foreground"
            />
          </div>
        </header>
        <main className="workspace-main-content">{children}</main>
      </div>
    </div>
  );
}
