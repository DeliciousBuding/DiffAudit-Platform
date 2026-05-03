import { headers } from "next/headers";

import { LanguagePicker } from "@/components/language-picker";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { UserAvatar } from "@/components/user-avatar";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { BrandMark, GithubIcon } from "@/components/platform-shell-icons";
import { PlatformNavMobile } from "@/components/platform-nav.client";
import { WorkspaceTopbarTitle } from "@/components/workspace-topbar-title";
import { WorkspaceGlobalSearch } from "@/components/workspace-global-search";
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
      </aside>

      <div className="workspace-main-area">
        <header className="workspace-topbar">
          <div className="workspace-topbar-left">
            <WorkspaceTopbarTitle locale={locale} />
          </div>
          <WorkspaceGlobalSearch locale={locale} />
          <div className="workspace-topbar-actions">
            <LanguagePicker value={locale} reloadOnChange />
            <ThemeToggleButton />
            <a
              href="https://github.com/DeliciousBuding/DiffAudit-Platform"
              target="_blank"
              rel="noreferrer"
              className="workspace-icon-button"
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
