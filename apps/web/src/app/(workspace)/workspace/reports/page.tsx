import { Suspense } from "react";
import { headers } from "next/headers";

import { type Locale } from "@/components/language-picker";
import { fetchAttackDefenseTable } from "@/lib/attack-defense-table";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { StatusBadge } from "@/components/status-badge";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { ExportReportButton } from "@/components/export-report-button";
import { TableSkeleton } from "@/components/skeleton";
import { ChartAucDistribution } from "@/components/chart-auc-distribution";
import { ChartRocCurve } from "@/components/chart-roc-curve";
import { ChartRiskDistribution } from "@/components/chart-risk-distribution";
import { ChartAttackComparison } from "@/components/chart-attack-comparison";
import { classifyRisk, riskLabel } from "@/lib/risk-report";
import { RiskBadge } from "@/components/risk-badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { MetricLabel } from "@/components/metric-label";
import { CompareView } from "@/components/compare-view";

// Cache RSC responses for 60s — demo data doesn't change during a session
export const revalidate = 60;

/** Generate synthetic ROC curve points given a target AUC */
function generateRocData(targetAuc: number): { fpr: number; tpr: number }[] {
  const points: { fpr: number; tpr: number }[] = [{ fpr: 0, tpr: 0 }];
  const steps = 20;
  for (let i = 1; i <= steps; i++) {
    const fpr = i / steps;
    const tpr = Math.min(1, Math.pow(fpr, 1 - targetAuc) * (0.9 + targetAuc * 0.1));
    points.push({ fpr, tpr: Math.max(fpr, Math.min(1, tpr)) });
  }
  return points;
}

/** Compute coverage gaps: attack/defense pairs with AUC > 0.7 (high risk, no defense) — 2.4.4 */
function computeCoverageGaps(rows: Array<{ attack: string; defense: string; aucLabel: string }>) {
  const THRESHOLD = 0.7;
  const gaps = rows
    .map((r) => ({
      attack: r.attack,
      defense: r.defense,
      auc: parseFloat(r.aucLabel),
    }))
    .filter((g) => !isNaN(g.auc) && g.auc >= THRESHOLD)
    .sort((a, b) => b.auc - a.auc)
    .slice(0, 10); // top 10 gaps

  return gaps;
}

/** Async server component that fetches and renders the audit results + export button */
async function AuditResultsSection({ locale }: { locale: Locale }) {
  const copy = WORKSPACE_COPY[locale].reports;
  const [table, catalog] = await Promise.all([
    fetchAttackDefenseTable(),
    fetchCatalogDashboard(),
  ]);
  const rows = table?.rows ?? [];
  const catalogSize = catalog?.stats.total ?? 0;
  const defendedRows = table?.stats.defended ?? 0;
  const contracts = catalog?.tracks.flatMap((track) => track.entries).slice(0, 6) ?? [];
  const localeCode = locale === "zh-CN" ? "zh-CN" : "en-US";

  // Build chart data
  const aucValues = rows
    .map((r) => parseFloat(r.aucLabel))
    .filter((v): v is number => !isNaN(v));

  const aucBins: Record<string, number> = {};
  for (const auc of aucValues) {
    const bin = (Math.floor(auc * 10) / 10).toFixed(1);
    aucBins[bin] = (aucBins[bin] || 0) + 1;
  }
  const aucDistData = Object.entries(aucBins)
    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
    .map(([auc, count]) => ({ auc: parseFloat(auc), count }));

  const avgAuc = aucValues.length > 0
    ? aucValues.reduce((a, b) => a + b, 0) / aucValues.length
    : 0.85;
  const rocData = generateRocData(avgAuc);

  const riskCounts = { high: 0, medium: 0, low: 0 };
  for (const row of rows) {
    const auc = parseFloat(row.aucLabel);
    if (!isNaN(auc)) {
      riskCounts[classifyRisk(auc)]++;
    }
  }
  const dims = copy.chartDimensions;
  const riskDistData = [
    { key: "high", label: riskLabel("high", locale), count: riskCounts.high },
    { key: "medium", label: riskLabel("medium", locale), count: riskCounts.medium },
    { key: "low", label: riskLabel("low", locale), count: riskCounts.low },
  ];

  const attackComparisonData = [
    { dimension: dims[0], Recon: 0.78, PIA: 0.65, GSA: 0.82 },
    { dimension: dims[1], Recon: 0.92, PIA: 0.71, GSA: 0.45 },
    { dimension: dims[2], Recon: 0.60, PIA: 0.85, GSA: 0.73 },
    { dimension: dims[3], Recon: 0.88, PIA: 0.79, GSA: 0.91 },
    { dimension: dims[4], Recon: 0.95, PIA: 0.68, GSA: 0.55 },
  ];

  // Coverage gaps visualization — 2.4.4
  const gapData = computeCoverageGaps(rows);

  const resultsContent = (
    <>
      {/* Charts section */}
      <div className="grid gap-3 lg:grid-cols-2" id="report-charts">
        <section className="rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.aucDistribution}
            </h2>
          </div>
          <div className="p-3">
            {aucDistData.length > 0 ? (
              <ChartAucDistribution data={aucDistData} />
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                {copy.emptyResults}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.rocCurve}
            </h2>
          </div>
          <div className="p-3">
            <ChartRocCurve data={rocData} />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.riskDistribution}
            </h2>
          </div>
          <div className="p-3">
            <ChartRiskDistribution data={riskDistData} />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.attackComparison}
            </h2>
          </div>
          <div className="p-3">
            <ChartAttackComparison data={attackComparisonData} />
          </div>
        </section>
      </div>

      {/* Coverage gaps visualization — 2.4.4 */}
      {gapData.length > 0 && (
        <section className="rounded-lg border border-border bg-card" id="coverage-gaps">
          <div className="border-b border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.coverageGaps}
            </h2>
            <span className="text-xs text-[color:var(--warning)]">
              {gapData.length} {copy.sections.highRiskGaps}
            </span>
          </div>
          <div className="p-3 space-y-2">
            {gapData.map((gap, i) => {
              const pct = Math.round(gap.auc * 100);
              const barColor = gap.auc >= 0.85 ? "var(--risk-high)" : gap.auc >= 0.75 ? "var(--risk-medium)" : "var(--risk-low)";
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-36 shrink-0 text-xs font-medium truncate" title={`${gap.attack} → ${gap.defense}`}>
                    <div className="truncate">{gap.attack}</div>
                    <div className="truncate text-xs text-muted-foreground">{gap.defense}</div>
                  </div>
                  <div className="flex-1 h-5 bg-muted/20 rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <span className="mono text-xs w-14 text-right">{gap.auc.toFixed(3)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <CompareView rows={rows} locale={locale} />

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
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.contractKey}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.label}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.systemGap}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.workspace}</th>
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
                    <td className="mono px-3 py-2 text-xs text-muted-foreground">{entry.contractKey}</td>
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

      <section className="rounded-lg border border-border bg-card" id="report-table">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {copy.sections.auditResults}
          </h2>
        </div>
        <div className="overflow-auto max-h-[440px]">
          {rows.length > 0 ? (
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-muted/30">
                <tr className="border-b border-border">
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.attack}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.defense}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.model}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.track}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.evidence}</th>
                  <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">
                    <MetricLabel label={copy.tableHeaders.auc} tooltip={copy.metricTooltips.auc} />
                  </th>
                  <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">
                    <MetricLabel label={copy.tableHeaders.asr} tooltip={copy.metricTooltips.asr} />
                  </th>
                  <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">
                    <MetricLabel label={copy.tableHeaders.tpr} tooltip={copy.metricTooltips.tpr} />
                  </th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.risk}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.track}-${row.attack}-${row.defense}-${row.model}-${row.evidenceLevel}-${index}`}
                    className={`table-row-hover border-b border-border transition-all duration-200 hover:bg-muted/30 ${
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
                    <td className="px-3 py-2">
                      <RiskBadge
                        auc={parseFloat(row.aucLabel)}
                        label={riskLabel(row.riskLevel, locale)}
                        locale={locale}
                      />
                    </td>
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

  return (
    <>
      {/* Header with export buttons */}
      <div className="flex items-start justify-between border-b border-border pb-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.eyebrow}</div>
          <h1 className="mt-1 text-lg font-semibold">{copy.title}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">{copy.description}</p>
        </div>
        <ExportReportButton
          rows={rows}
          label={copy.exportSummary}
          locale={localeCode}
          catalogSize={catalogSize}
          defendedRows={defendedRows}
          contracts={contracts}
        />
      </div>

      {resultsContent}
    </>
  );
}

export default async function WorkspaceReportsPage({ locale }: { locale?: Locale } = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const navItems = WORKSPACE_COPY[resolvedLocale].nav;

  return (
    <div className="space-y-4 page-entrance">
      <Breadcrumb items={[
        { label: navItems[0].title, href: "/workspace" },
        { label: navItems[2].title }
      ]} />
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
    </div>
  );
}
