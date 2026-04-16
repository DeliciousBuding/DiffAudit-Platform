import { headers } from "next/headers";

import { LanguagePicker } from "@/components/language-picker";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveLocaleFromHeaderStore(await headers());

  return (
    <main className="site-shell auth-layout-main">
      <header className="site-header">
        <div className="container site-header-inner">
          <BrandMark compact />
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <LanguagePicker value={locale} reloadOnChange />
          </div>
        </div>
      </header>

      <section className="auth-layout-shell">
        <div className="container auth-layout-stage">
          {children}
        </div>
      </section>
    </main>
  );
}
