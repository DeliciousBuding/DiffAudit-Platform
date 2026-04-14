import { PlatformShell } from "@/components/platform-shell";

export const dynamic = "force-dynamic";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PlatformShell>
      {children}
    </PlatformShell>
  );
}
