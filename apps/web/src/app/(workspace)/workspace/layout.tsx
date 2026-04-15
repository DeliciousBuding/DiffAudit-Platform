import { PlatformShell } from "@/components/platform-shell";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/error-boundary";

export const dynamic = "force-dynamic";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <ErrorBoundary>
        <PlatformShell>
          {children}
        </PlatformShell>
      </ErrorBoundary>
    </Providers>
  );
}
