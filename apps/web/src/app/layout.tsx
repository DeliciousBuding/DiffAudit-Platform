import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import { RouteRecovery } from "@/components/route-recovery";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang={locale === "zh-CN" ? "zh-CN" : "en-US"} className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full bg-background text-foreground font-sans">
        <RouteRecovery />
        {children}
      </body>
    </html>
  );
}

