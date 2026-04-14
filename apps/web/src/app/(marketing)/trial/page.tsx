import { headers } from "next/headers";

import { BrandMark } from "@/components/brand-mark";
import { TrialForm } from "@/components/trial-form";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export const dynamic = "force-dynamic";

export default async function TrialPage() {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[locale];

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container site-header-inner">
          <BrandMark compact />
        </div>
      </header>

      <section className="container py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="workspace-highlight">
            <div className="caption">{copy.trialPage.eyebrow}</div>
            <h1 className="mt-3 text-[34px] font-[450] leading-tight">{copy.trialPage.title}</h1>
            <p className="mt-4 max-w-[48ch] text-sm leading-7 text-muted-foreground">
              {copy.trialPage.description}
            </p>
          </div>

          <TrialForm copy={copy.trialForm} />
        </div>
      </section>
    </main>
  );
}
