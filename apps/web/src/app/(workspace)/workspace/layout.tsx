import { PlatformShell } from "@/components/platform-shell";
import { Providers } from "@/components/providers";

export const dynamic = "force-dynamic";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <PlatformShell>
        {children}
      </PlatformShell>
    </Providers>
  );
}
