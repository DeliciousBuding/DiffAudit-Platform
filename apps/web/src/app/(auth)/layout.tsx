import { headers } from "next/headers";

import { LanguagePicker } from "@/components/language-picker";
import { BrandMark } from "@/components/brand-mark";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveLocaleFromHeaderStore(await headers());

  return (
    <main className="site-shell auth-layout-main">
      <header className="site-header">
        <div className="container site-header-inner">
          <BrandMark compact />
          <LanguagePicker value={locale} reloadOnChange />
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
