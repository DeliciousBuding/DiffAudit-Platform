import type { Metadata } from "next";
import { headers } from "next/headers";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiffAudit Platform",
  description: "Membership inference audit platform for diffusion models.",
  icons: {
    icon: [
      { url: "/brand/diffaudit-logo-black-no-text.svg", type: "image/svg+xml" },
    ],
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = resolveLocaleFromHeaderStore(await headers());

  return (
    <html lang={locale === "zh-CN" ? "zh-CN" : "en-US"} className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
