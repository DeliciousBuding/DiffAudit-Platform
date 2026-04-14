import { Suspense } from "react";
import { headers } from "next/headers";

import { type Locale } from "@/components/language-picker";
import { fetchAttackDefenseTable } from "@/lib/attack-defense-table";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { StatusBadge } from "@/components/status-badge";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { ExportReportButton } from "@/components/export-report-button";
import type { ReportExportRow } from "@/lib/risk-report";
import { TableSkeleton } from "@/components/skeleton";

/** Async server component that fetches and renders the audit results + export button */
async function AuditResultsSection({ locale }: { locale: Locale }) {
  const copy = WORKSPACE_COPY[locale].reports;
  const table = await fetchAttackDefenseTable();
  const rows = table?.rows ?? [];
  const localeCode = locale === "zh-CN" ? "zh-CN" : "en";
  const exportRows: ReportExportRow[] = rows.map((r) => ({
    track: r.track,
    attack: r.attack,
    defense: r.defense,
    model: r.model,
    aucLabel: r.aucLabel,
    asrLabel: r.asrLabel,
    tprLabel: r.tprLabel,
    evidenceLevel: r.evidenceLevel,
  }));

  return (
    <>
      {/* Export button sits in the header area, but needs data */}
      <div className="flex items-start justify-between border-b border-border pb-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.eyebrow}</div>
          <h1 className="mt-1 text-lg font-semibold">{copy.title}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">{copy.description}</p>
        </div>
        <ExportReportButton
          rows={exportRows}
          label={copy.exportSummary}
          locale={localeCode}
        />
      </div>

      <section className="border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {copy.sections.auditResults}
          </h2>
        </div>
        <div className="overflow-auto max-h-[440px]">
          {rows.length > 0 ? (
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-muted/30">
                <tr className="border-b border-border">
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Attack</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Defense</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Model</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Track</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Evidence</th>
                  <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">AUC</th>
                  <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">ASR</th>
                  <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">TPR</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.track}-${row.attack}-${row.defense}`}
                    className={`table-row-hover border-b border-border transition-colors hover:bg-muted/30 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/10"
                    }`}
                  >
                    <td className="px-3 py-2 font-medium">{row.attack}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.defense}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.model}</td>
                    <td className="px-3 py-2">
                      <StatusBadge tone="info">{row.track}</StatusBadge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{row.evidenceLevel}</td>
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
    </>
  );
}

/** Async server component that fetches and renders the coverage gaps table */
async function CoverageGapsSection({ locale }: { locale: Locale }) {
  const copy = WORKSPACE_COPY[locale].reports;
  const catalog = await fetchCatalogDashboard();
  const contracts = catalog?.tracks.flatMap((track) => track.entries).slice(0, 6) ?? [];

  return (
    <section className="border border-border bg-card">
      <div className="border-b border-border bg-muted/20 px-3 py-2">
        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {copy.sections.coverageGaps}
        </h2>
      </div>
      <div className="overflow-auto">
        {contracts.length > 0 ? (
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 bg-muted/30">
              <tr className="border-b border-border">
                <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Contract Key</th>
                <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Label</th>
                <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">System Gap</th>
                <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Workspace</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((entry, index) => (
                <tr
                  key={entry.contractKey}
                  className={`table-row-hover border-b border-border transition-colors hover:bg-muted/30 ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  }`}
                >
                  <td className="mono px-3 py-2 text-[10px] text-muted-foreground">{entry.contractKey}</td>
                  <td className="px-3 py-2 font-medium">{entry.label}</td>
                  <td className="px-3 py-2 text-muted-foreground max-w-xs">{entry.systemGap}</td>
                  <td className="px-3 py-2 text-muted-foreground">{entry.bestWorkspace}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-3 py-4 text-xs text-muted-foreground text-center">
            {copy.emptyGaps}
          </div>
        )}
      </div>
    </section>
  );
}

export default async function WorkspaceReportsPage({ locale }: { locale?: Locale } = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());

  return (
    <div className="space-y-4">
      <Suspense fallback={
        <>
          <div className="border-b border-border pb-3">
            <div className="h-3 w-20 animate-pulse rounded bg-muted/30" />
            <div className="mt-2 h-5 w-32 animate-pulse rounded bg-muted/30" />
            <div className="mt-1 h-3 w-48 animate-pulse rounded bg-muted/30" />
          </div>
          <section className="border border-border bg-card">
            <TableSkeleton rows={10} cols={8} />
          </section>
        </>
      }>
        <AuditResultsSection locale={resolvedLocale} />
      </Suspense>

      <Suspense fallback={
        <section className="border border-border bg-card">
          <TableSkeleton rows={6} cols={4} />
        </section>
      }>
        <CoverageGapsSection locale={resolvedLocale} />
      </Suspense>
    </div>
  );
}
