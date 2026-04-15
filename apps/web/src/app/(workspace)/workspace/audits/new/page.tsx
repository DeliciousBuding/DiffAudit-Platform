import { headers } from "next/headers";

import { type Locale } from "@/components/language-picker";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { CreateTaskClient } from "./CreateTaskClient";
import { Breadcrumb } from "@/components/breadcrumb";

export default async function CreateTaskPage({ locale }: { locale?: Locale } = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].createTask;
  const navItems = WORKSPACE_COPY[resolvedLocale].nav;

  // Fetch catalog for model selection step
  const catalog = await fetchCatalogDashboard();
  const availableModels = catalog
    ? catalog.tracks.flatMap((track) =>
        track.entries
          .filter((entry) => entry.availability === "ready" || entry.availability === "partial")
          .map((entry) => ({
            contractKey: entry.contractKey,
            label: entry.label,
            track: entry.track,
            capabilityLabel: entry.capabilityLabel,
            availability: entry.availability,
          }))
      )
    : [];

  return (
    <div className="space-y-4">
      <Breadcrumb items={[
        { label: navItems[0].title, href: "/workspace" },
        { label: navItems[1].title, href: "/workspace/audits" },
        { label: copy.title }
      ]} />

      {/* Page header */}
      <div className="border-b border-border pb-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.eyebrow}</div>
        <h1 className="mt-1 text-lg font-semibold">{copy.title}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{copy.description}</p>
      </div>

      <CreateTaskClient
        locale={resolvedLocale}
        availableModels={availableModels}
      />
    </div>
  );
}
