import { headers } from "next/headers";

import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { WorkspacePage } from "@/components/workspace-page";

export default async function WorkspaceSettingsPage() {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[locale].settings;

  return (
    <WorkspacePage
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {copy.sections.map((section) => (
          <section key={section.title} className="surface-card p-6">
            <div className="caption">{section.title}</div>
            <h2 className="mt-3 text-[24px] font-[450] leading-tight">{section.title}</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{section.copy}</p>
          </section>
        ))}
      </div>
    </WorkspacePage>
  );
}
