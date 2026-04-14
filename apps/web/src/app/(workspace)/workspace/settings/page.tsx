import { headers } from "next/headers";

import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export default async function WorkspaceSettingsPage() {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[locale].settings;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="border-b border-border pb-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.eyebrow}</div>
        <h1 className="mt-1 text-lg font-semibold">{copy.title}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{copy.description}</p>
      </div>

      {/* Settings sections */}
      <div className="grid gap-3 lg:grid-cols-3">
        {copy.sections.map((section) => (
          <section key={section.title} className="border border-border bg-card p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</div>
            <h2 className="mt-2 text-sm font-semibold">{section.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{section.copy}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
