import { Suspense } from "react";
import { headers } from "next/headers";

import { type Locale } from "@/components/language-picker";
import { fetchAttackDefenseTable } from "@/lib/attack-defense-table";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { StatusBadge } from "@/components/status-badge";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { KpiRowSkeleton, TableSkeleton } from "@/components/skeleton";

function KpiCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold leading-none">{value}</div>
      <p className="mt-1 text-[10px] text-muted-foreground leading-tight">{note}</p>
    </div>
  );
}

/** Async server component that fetches and renders the KPI + table data */
async function WorkspaceData({ locale }: { locale: Locale }) {
  const copy = WORKSPACE_COPY[locale].workspace;
  const [catalog, table] = await Promise.all([
    fetchCatalogDashboard(),
    fetchAttackDefenseTable(),
  ]);

  const activeContracts = catalog?.stats.total ?? 0;
  const defendedRows = table?.stats.defended ?? 0;
  const recentRows = table?.rows.slice(0, 10) ?? [];

  const aucValues = (table?.rows ?? [])
    .map((r) => parseFloat(r.aucLabel))
    .filter((v): v is number => !isNaN(v));
  const avgAuc = aucValues.length > 0
    ? (aucValues.reduce((a, b) => a + b, 0) / aucValues.length).toFixed(3)
    : "n/a";
  const totalRows = table?.stats.total ?? 0;

  return (
    <>
      {/* KPI row */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KpiCard label={copy.kpis.liveContractsLabel} value={String(activeContracts)} note={copy.kpis.liveContractsNote} />
        <KpiCard label={copy.kpis.defendedRowsLabel} value={String(defendedRows)} note={copy.kpis.defendedRowsNote} />
        <KpiCard label={copy.kpis.avgAucLabel} value={avgAuc} note={copy.kpis.avgAucNote} />
        <KpiCard label={copy.kpis.defenseEvaluatedLabel} value={String(defendedRows)} note={`${totalRows} ${copy.kpis.defenseEvaluatedNote}`} />
      </div>

      {/* Main content grid */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Recent results table */}
        <section className="lg:col-span-2 border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.recentResults}
            </h2>
          </div>
          <div className="overflow-auto max-h-[380px]">
            {recentRows.length > 0 ? (
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 bg-muted/30">
                  <tr className="border-b border-border">
                    <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Attack</th>
                    <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Model</th>
                    <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Track</th>
                    <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">AUC</th>
                    <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">ASR</th>
                    <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">TPR</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRows.map((row, index) => (
                    <tr
                      key={`${row.track}-${row.attack}-${row.defense}`}
                      className={`table-row-hover border-b border-border transition-colors hover:bg-muted/30 ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/10"
                      }`}
                    >
                      <td className="px-3 py-2 font-medium">{row.attack}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.model}</td>
                      <td className="px-3 py-2">
                        <StatusBadge tone="info">{row.track}</StatusBadge>
                      </td>
                      <td className="mono px-3 py-2 text-right">{row.aucLabel}</td>
                      <td className="mono px-3 py-2 text-right">{row.asrLabel}</td>
                      <td className="mono px-3 py-2 text-right">{row.tprLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                {copy.emptyResults}
              </div>
            )}
          </div>
        </section>

        {/* Tasks panel */}
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.tasks}
            </h2>
          </div>
          <div className="p-3">
            {copy.todoItems.map((item, index) => (
              <div key={item} className="flex items-start gap-2 border-b border-border py-2 last:border-0">
                <span className="mono inline-flex h-4 w-4 shrink-0 items-center justify-center bg-accent text-[9px] font-semibold rounded-sm">
                  {index + 1}
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default async function WorkspaceHomePage({ locale }: { locale?: Locale } = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].workspace;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="border-b border-border pb-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.eyebrow}</div>
        <h1 className="mt-1 text-lg font-semibold">{copy.title}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{copy.description}</p>
      </div>

      <Suspense fallback={
        <>
          <KpiRowSkeleton />
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2 border border-border bg-card">
              <TableSkeleton rows={10} cols={6} />
            </div>
            <div className="border border-border bg-card">
              <div className="p-3 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 animate-pulse rounded bg-muted/30" />
                ))}
              </div>
            </div>
          </div>
        </>
      }>
        <WorkspaceData locale={resolvedLocale} />
      </Suspense>
    </div>
  );
}
