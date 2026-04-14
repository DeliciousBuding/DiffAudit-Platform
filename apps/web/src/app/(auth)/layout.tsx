import { LanguagePicker } from "@/components/language-picker";
import { BrandMark } from "@/components/brand-mark";
import { readServerLocale } from "@/lib/locale";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = await readServerLocale();

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container site-header-inner">
          <BrandMark compact />
          <LanguagePicker value={locale} reloadOnChange />
        </div>
      </header>

      <section className="container py-12 md:py-20">
        {children}
      </section>
    </main>
  );
}
