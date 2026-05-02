import { headers } from "next/headers";

import { PlatformShell } from "@/components/platform-shell";
import { Providers } from "@/components/providers";
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
        <WorkspaceKeyboardShortcuts locale={locale} />
        {children}
      </PlatformShell>
    </Providers>
  );
}
