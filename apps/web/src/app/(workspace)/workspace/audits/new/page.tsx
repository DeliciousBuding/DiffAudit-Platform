import { Suspense, cache, use } from "react";

import { type Locale } from "@/components/language-picker";
import { Breadcrumb } from "@/components/breadcrumb";
import { clientLocale } from "@/lib/next-shims/runtime";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { getWorkspaceCatalogData } from "@/lib/workspace-source";
import { CreateTaskClient } from "./CreateTaskClient";

const loadCatalog = cache(() => getWorkspaceCatalogData());

function CreateTaskLoaded({ locale }: { locale: Locale }) {
  const copy = WORKSPACE_COPY[locale].createTask;

  // Fetch catalog for model selection step
  const catalog = use(loadCatalog());
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

  const isZh = locale === "zh-CN";
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
        locale={locale}
        availableModels={availableModels}
      />
    </div>
  );
}

export default function CreateTaskPage() {
  const locale = clientLocale();

  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <CreateTaskLoaded locale={locale} />
    </Suspense>
  );
}
