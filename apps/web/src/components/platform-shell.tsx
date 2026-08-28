import { LanguagePicker } from "@/components/language-picker";
import { UserAvatar } from "@/components/user-avatar";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { BrandMark, GithubIcon } from "@/components/platform-shell-icons";
import { WorkspaceTopbarTitle } from "@/components/workspace-topbar-title";
import { WorkspaceGlobalSearch } from "@/components/workspace-global-search";
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { clientLocale } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

/**
 * PlatformShell — the workspace frame, now built on the shadcn sidebar block.
 *
 * Replaces the bespoke `.workspace-layout` / `.workspace-sidebar` /
 * `.workspace-main-area` grid (in globals.css) with `SidebarProvider` +
 * `Sidebar collapsible="icon"` + `SidebarInset`. Collapse is Ctrl+B or the
 * topbar `SidebarTrigger` (cookie-persisted). On mobile the sidebar renders
 * as a Sheet opened by the same trigger — replacing the legacy
 * `PlatformNavMobile` bottom dock with one nav surface. The topbar's
 * duplicate `ThemeToggleButton` is gone; the single theme control lives in
 * the sidebar footer (see WorkspaceSidebar).
 */
export function PlatformShell({ children }: { children: React.ReactNode }) {
  const locale = clientLocale();
  const copy = WORKSPACE_COPY[locale];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-3">
          <BrandMark />
        </SidebarHeader>
        <WorkspaceSidebar locale={locale} />
      </Sidebar>
      <SidebarInset>
        <header className="workspace-topbar sticky top-0 z-40 flex h-12 items-center gap-3 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <WorkspaceTopbarTitle locale={locale} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <WorkspaceGlobalSearch locale={locale} />
            <LanguagePicker value={locale} reloadOnChange />
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
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
