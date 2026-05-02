import { headers } from "next/headers";

import { CommandPalette } from "@/components/command-palette";
import { NavigationProgress } from "@/components/navigation-progress";
import { PlatformShell } from "@/components/platform-shell";
import { Providers } from "@/components/providers";
import { ScrollToTop } from "@/components/scroll-to-top";
import { WorkspaceKeyboardShortcuts } from "@/components/workspace-keyboard-shortcuts";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = resolveLocaleFromHeaderStore(await headers());
  return (
    <Providers>
      <PlatformShell>
        <CommandPalette locale={locale} />
        <WorkspaceKeyboardShortcuts locale={locale} />
        <NavigationProgress />
        <ScrollToTop />
        {children}
      </PlatformShell>
    </Providers>
  );
}
