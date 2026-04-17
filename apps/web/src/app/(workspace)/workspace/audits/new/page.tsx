import { headers } from "next/headers";

import { type Locale } from "@/components/language-picker";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { CreateTaskClient } from "./CreateTaskClient";

export default async function CreateTaskPage() {
  const resolvedLocale = resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].createTask;

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
