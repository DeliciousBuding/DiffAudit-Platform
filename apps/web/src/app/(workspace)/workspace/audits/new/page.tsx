import { headers } from "next/headers";

import { type Locale } from "@/components/language-picker";
import { Breadcrumb } from "@/components/breadcrumb";
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

  const isZh = resolvedLocale === "zh-CN";
  const breadcrumbItems = [
    { label: isZh ? "工作台" : "Dashboard", href: "/workspace/start" },
    { label: isZh ? "审计任务" : "Audits", href: "/workspace/audits" },
    { label: copy.title },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumb items={breadcrumbItems} />

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
