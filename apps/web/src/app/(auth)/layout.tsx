import { headers } from "next/headers";

import { LanguagePicker } from "@/components/language-picker";
import { BrandMark } from "@/components/brand-mark";
import { GithubIcon } from "@/components/platform-shell-icons";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveLocaleFromHeaderStore(await headers());

  return (
    <main className="min-h-[100svh] flex flex-col lg:flex-row relative">
      <header className="absolute top-0 left-0 w-full z-50 p-6 lg:p-8 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto">
          <BrandMark compact href="/" prefetch={false} />
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <ThemeToggleButton />
          <LanguagePicker value={locale} reloadOnChange compact />
          <a
            href="https://github.com/DeliciousBuding/DiffAudit-Research"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center p-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="GitHub"
          >
            <GithubIcon />
          </a>
        </div>
      </header>

      {children}
    </main>
  );
}
