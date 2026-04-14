import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiffAudit Platform",
  description: "Membership inference audit platform for diffusion models.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("platform-locale-v2")?.value === "zh-CN" ? "zh-CN" : "en-US";

  return (
    <html lang={locale === "zh-CN" ? "zh-CN" : "en"} className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
