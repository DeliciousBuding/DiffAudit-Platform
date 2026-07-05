import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import { RouteRecovery } from "@/components/route-recovery";
import { JsonLd } from "@/components/json-ld";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "DiffAudit — Membership Inference Audit for Diffusion Models",
    template: "%s | DiffAudit",
  },
  description:
    "Open-source privacy-risk audit workspace for diffusion models. Inspect training-data membership signals with evidence-gated metrics, contract-level reports, and reproducible attack/defense benchmarks.",
  metadataBase: new URL(
    process.env.DIFFAUDIT_PLATFORM_URL ?? "http://localhost:3000",
  ),
  icons: {
    icon: [
      { url: "/brand/diffaudit-logo-black-no-text.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "DiffAudit — Membership Inference Audit for Diffusion Models",
    description:
      "Open-source privacy-risk audit workspace for diffusion models. Evidence-gated metrics, contract-level reports, reproducible benchmarks.",
    type: "website",
    siteName: "DiffAudit Platform",
    images: [
      {
        url: "/brand/og-default.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DiffAudit — Membership Inference Audit for Diffusion Models",
    description:
      "Open-source privacy-risk audit workspace for diffusion models.",
    images: ["/brand/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-xl focus:bg-[var(--accent-blue)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:no-underline"
        >
          {locale === "zh-CN" ? "跳到主内容" : "Skip to main content"}
        </a>
        <div id="main-content" tabIndex={-1} />
        <RouteRecovery />
        <JsonLd />
        {children}
      </body>
    </html>
  );
}

