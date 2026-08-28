import { Outlet } from "react-router";

import { CommandPalette } from "@/components/command-palette";
import { NavigationProgress } from "@/components/navigation-progress";
import { PlatformShell } from "@/components/platform-shell";
import { Providers } from "@/components/providers";
import { ScrollToTop } from "@/components/scroll-to-top";
import { WorkspaceKeyboardShortcuts } from "@/components/workspace-keyboard-shortcuts";
import { clientLocale } from "@/lib/next-shims/runtime";

export default function WorkspaceLayout() {
  const locale = clientLocale();
  return (
    <Providers>
      <PlatformShell>
        <CommandPalette locale={locale} />
        <WorkspaceKeyboardShortcuts locale={locale} />
        <NavigationProgress />
        <ScrollToTop locale={locale} />
        <Outlet />
      </PlatformShell>
    </Providers>
  );
}
