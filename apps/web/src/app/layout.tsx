import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiffAudit Platform",
  description: "Diffusion membership inference platform for audit, reporting, and workspace review.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
