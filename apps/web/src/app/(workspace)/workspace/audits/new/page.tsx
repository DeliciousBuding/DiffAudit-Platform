import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { getWorkspaceCatalogData } from "@/lib/workspace-source";
import { CreateTaskClient } from "./CreateTaskClient";

type CreateTaskPageOptions = {
  locale?: Locale;
};

async function renderCreateTaskPage({ locale }: CreateTaskPageOptions = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].createTask;

  // Fetch catalog for model selection step
  const catalog = await getWorkspaceCatalogData();
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
      {/* Back button */}
      <Link
        href="/workspace/audits"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> {copy.backToTasks}
      </Link>

      {/* Page header */}
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-semibold">{copy.title}</h1>
      </div>

      <CreateTaskClient
        locale={resolvedLocale}
        availableModels={availableModels}
      />
    </div>
  );
}

export default async function CreateTaskPage() {
  return renderCreateTaskPage();
}
