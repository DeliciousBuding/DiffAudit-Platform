import { headers } from "next/headers";

import { LanguagePicker } from "@/components/language-picker";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { UserAvatar } from "@/components/user-avatar";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { BrandMark, GithubIcon } from "@/components/platform-shell-icons";
import { RuntimeStatusBadge } from "@/components/runtime-status-badge";
import { StatusBadge } from "@/components/status-badge";
import { PlatformNavMobile } from "@/components/platform-nav.client";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { getWorkspaceDataMode } from "@/lib/workspace-source";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export async function PlatformShell({ children }: { children: React.ReactNode }) {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[locale];
  const dataMode = await getWorkspaceDataMode();

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
          <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
            <StatusBadge tone="info">{copy.shell.siteBadge}</StatusBadge>
            {dataMode !== "demo" ? (
              <StatusBadge tone="success">{copy.shell.liveMode}</StatusBadge>
            ) : null}
          </div>
          <div className="flex items-center gap-1 px-3 pb-3">
            <RuntimeStatusBadge locale={locale} />
          </div>
        </div>
      </aside>

      <div className="workspace-main-area">
        <header className="workspace-topbar">
          <div className="flex items-center gap-2 flex-wrap">
            {dataMode !== "demo" ? (
              <StatusBadge tone="success">{copy.shell.liveMode}</StatusBadge>
            ) : null}
            <RuntimeStatusBadge locale={locale} />
          </div>
          <div className="flex items-center gap-2">
            <LanguagePicker value={locale} reloadOnChange />
            <ThemeToggleButton />
            <a
              href="https://github.com/DeliciousBuding/DiffAudit-Platform"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-background/50 text-muted-foreground backdrop-blur-sm transition hover:bg-muted/50 hover:text-foreground"
              title={copy.shell.githubTitle}
            >
              <GithubIcon />
            </a>
            <UserAvatar locale={locale} />
          </div>
        </header>
        <main className="workspace-main-content">{children}</main>
      </div>

      <PlatformNavMobile locale={locale} />
    </div>
  );
}
