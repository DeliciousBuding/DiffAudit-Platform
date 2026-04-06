import { PlatformShell } from "@/components/platform-shell";

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PlatformShell>{children}</PlatformShell>;
}
