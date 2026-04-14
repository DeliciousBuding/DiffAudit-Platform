import { headers } from "next/headers";

import { type Locale } from "@/components/language-picker";
import { fetchAttackDefenseTable } from "@/lib/attack-defense-table";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { ContractsTable } from "@/components/contracts-table";
import { JobsList } from "@/components/jobs-list";
import { ResultsTable } from "@/components/results-table";
import { AuditToolbar } from "@/components/audit-toolbar";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export default async function WorkspaceAuditsPage({ locale }: { locale?: Locale } = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].audits;
  const [catalog, table] = await Promise.all([
    fetchCatalogDashboard(),
    fetchAttackDefenseTable(),
  ]);

  const recommendedContracts =
    catalog?.tracks.flatMap((track) => track.entries).slice(0, 5) ?? [];
  const recentRows = table?.rows.slice(0, 8) ?? [];

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="border-b border-border pb-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.eyebrow}</div>
        <h1 className="mt-1 text-lg font-semibold">{copy.title}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{copy.description}</p>
      </div>

      {/* Toolbar */}
      <div className="border border-border bg-card">
        <AuditToolbar locale={resolvedLocale} />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Recommended contracts */}
        <section className="lg:col-span-2 border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.recommendedContracts}
            </h2>
          </div>
          <div className="overflow-auto max-h-[420px]">
            <ContractsTable contracts={recommendedContracts} locale={resolvedLocale} />
          </div>
        </section>

        {/* Running jobs */}
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.runningJobs}
            </h2>
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-info animate-pulse" />
          </div>
          <div className="overflow-auto max-h-[420px]">
            <JobsList locale={resolvedLocale} />
          </div>
        </section>
      </div>

      {/* Recent results */}
      <section className="border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {copy.sections.recentResults}
          </h2>
        </div>
        <div className="overflow-auto max-h-[360px]">
          <ResultsTable rows={recentRows} emptyMessage={copy.emptyResults} />
        </div>
      </section>
    </div>
  );
}
