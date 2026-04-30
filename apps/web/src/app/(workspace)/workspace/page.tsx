import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";

import { type Locale } from "@/components/language-picker";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { StatusBadge } from "@/components/status-badge";
import { RiskBadge } from "@/components/risk-badge";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { KpiRowSkeleton, TableSkeleton } from "@/components/skeleton";
import { classifyRisk } from "@/lib/risk-report";
import { ChartAucDistribution } from "@/components/chart-auc-distribution";
import { ChartRocCurve } from "@/components/chart-roc-curve";
import { ChartRiskDistribution } from "@/components/chart-risk-distribution";
import { ChartAttackComparison } from "@/components/chart-attack-comparison";
import { ChartRiskRadar } from "@/components/chart-risk-radar";
import { WorkspacePageFrame, WorkspaceSectionCard } from "@/components/workspace-frame";
import { getWorkspaceAttackDefenseData, getWorkspaceCatalogData } from "@/lib/workspace-source";

export const dynamic = "force-dynamic";

/** Generate synthetic ROC curve points given a target AUC */
function generateRocData(targetAuc: number): { fpr: number; tpr: number }[] {
  const points: { fpr: number; tpr: number }[] = [{ fpr: 0, tpr: 0 }];
  const steps = 20;
  for (let i = 1; i <= steps; i++) {
    const fpr = i / steps;
    // Approximate ROC curve: tpr = fpr^(1 - targetAuc) with adjustments
    const tpr = Math.min(1, Math.pow(fpr, 1 - targetAuc) * (0.9 + targetAuc * 0.1));
    points.push({ fpr, tpr: Math.max(fpr, Math.min(1, tpr)) });
  }
  return points;
}

function KpiIcon({ type }: { type: "catalog" | "shield" | "chart" | "report" }) {
  const paths = {
    catalog: (
      <>
        <path d="M6 5.5h12v13H6z" />
        <path d="M9 9h6M9 12h6M9 15h3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 4.5 18 7v5.2c0 4-2.4 6.8-6 8.3-3.6-1.5-6-4.3-6-8.3V7l6-2.5Z" />
        <path d="m9.2 12.4 1.9 1.9 3.9-4.4" />
      </>
    ),
    chart: (
      <>
        <path d="M5 19h14" />
        <path d="M7.5 15.5 11 12l2.6 2.2 3.9-6" />
        <path d="M7.5 15.5v-3M11 12V8m2.6 6.2V10m3.9-1.8V5" />
      </>
    ),
    report: (
      <>
        <path d="M7 4.5h7l3 3v12H7z" />
        <path d="M14 4.5v3h3" />
        <path d="M9.5 12h5M9.5 15h5" />
      </>
    ),
  };

  return (
    <span className={`workspace-kpi-icon is-${type}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths[type]}
      </svg>
    </span>
  );
}

/** KPI card with trend arrow (up/down/flat) — 2.4.1 */
function KpiCardWithTrend({
  icon,
  label,
  value,
  note,
  trend,
}: {
  icon: "catalog" | "shield" | "chart" | "report";
  label: string;
  value: string;
  note: string;
  trend?: "up" | "down" | "flat";
}) {
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : null;
  const trendColor = trend === "up" ? "text-[color:var(--warning)]" : trend === "down" ? "text-[color:var(--success)]" : "text-muted-foreground";
  return (
    <div className="workspace-kpi-card card-animate">
      <div className="workspace-kpi-card-head">
        <KpiIcon type={icon} />
        <div className="workspace-kpi-card-label">{label}</div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="workspace-kpi-card-value">{value}</span>
        {trendIcon ? <span className={`text-base ${trendColor}`}>{trendIcon}</span> : null}
      </div>
      <p className="workspace-kpi-card-note">{note}</p>
    </div>
  );
}

/** Async server component that fetches and renders the KPI + table data */
async function WorkspaceData({ locale }: { locale: Locale }) {
  const localeData = WORKSPACE_COPY[locale];
  const copy = localeData.workspace;
  const [catalog, table] = await Promise.all([
    getWorkspaceCatalogData(),
    getWorkspaceAttackDefenseData(),
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

  const riskCounts = { high: 0, medium: 0, low: 0 };
  for (const row of table?.rows ?? []) {
    const auc = parseFloat(row.aucLabel);
    if (!isNaN(auc)) {
      riskCounts[classifyRisk(auc)]++;
    }
  }
  const totalRisk = riskCounts.high + riskCounts.medium + riskCounts.low;

  // Compute simple trend: compare last 5 rows vs previous 5 for avg AUC — 2.4.1
  const allAuc = (table?.rows ?? [])
    .map((r) => parseFloat(r.aucLabel))
    .filter((v): v is number => !isNaN(v));
  let aucTrend: "up" | "down" | "flat" = "flat";
  if (allAuc.length >= 10) {
    const recent = allAuc.slice(0, 5);
    const previous = allAuc.slice(5, 10);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
    const delta = recentAvg - previousAvg;
    aucTrend = delta > 0.02 ? "up" : delta < -0.02 ? "down" : "flat";
  }

  // Build AUC distribution histogram (bin by 0.1 intervals)
  const aucBins: Record<string, number> = {};
  for (const auc of aucValues) {
    const bin = (Math.floor(auc * 10) / 10).toFixed(1);
    aucBins[bin] = (aucBins[bin] || 0) + 1;
  }
  const aucDistData = Object.entries(aucBins)
    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
    .map(([auc, count]) => ({ auc: parseFloat(auc), count }));

  // Build ROC curve data from AUC values (synthetic curve for display)
  const rocData = aucValues.length > 0
    ? generateRocData(avgAuc !== "n/a" ? parseFloat(avgAuc) : 0.85)
    : generateRocData(0.85);

  const riskDistData = [
    { key: "high", label: copy.sections.riskLabels.high, count: riskCounts.high },
    { key: "medium", label: copy.sections.riskLabels.medium, count: riskCounts.medium },
    { key: "low", label: copy.sections.riskLabels.low, count: riskCounts.low },
  ];

  const dims = copy.sections.chartDimensions;
  const attackComparisonData = [
    { dimension: dims[0], Recon: 0.78, PIA: 0.65, GSA: 0.82 },
    { dimension: dims[1], Recon: 0.92, PIA: 0.71, GSA: 0.45 },
    { dimension: dims[2], Recon: 0.60, PIA: 0.85, GSA: 0.73 },
    { dimension: dims[3], Recon: 0.88, PIA: 0.79, GSA: 0.91 },
    { dimension: dims[4], Recon: 0.95, PIA: 0.68, GSA: 0.55 },
  ];

  // Risk radar data — 7.1
  const avgAucNum = avgAuc !== "n/a" ? parseFloat(avgAuc) : 0.85;
  const avgAsr = (table?.rows ?? [])
    .map((r) => parseFloat(r.asrLabel))
    .filter((v): v is number => !isNaN(v));
  const avgAsrNum = avgAsr.length > 0 ? avgAsr.reduce((a, b) => a + b, 0) / avgAsr.length : 0.3;
  const avgTpr = (table?.rows ?? [])
    .map((r) => parseFloat(r.tprLabel))
    .filter((v): v is number => !isNaN(v));
  const avgTprNum = avgTpr.length > 0 ? avgTpr.reduce((a, b) => a + b, 0) / avgTpr.length : 0.6;
  const coverageRatio = totalRows > 0 ? 1 - (riskCounts.low / totalRows) : 0.5;
  const defenseEffectiveness = defendedRows > 0 ? Math.min(1, defendedRows / Math.max(1, totalRows) * 2) : 0.2;

  const radarData = [
    { dimension: "auc", label: copy.sections.radarLabels.auc, value: avgAucNum },
    { dimension: "asr", label: copy.sections.radarLabels.asr, value: avgAsrNum },
    { dimension: "tpr", label: copy.sections.radarLabels.tpr, value: avgTprNum },
    { dimension: "coverage", label: copy.sections.radarLabels.coverage, value: coverageRatio },
    { dimension: "defense", label: copy.sections.radarLabels.defense, value: defenseEffectiveness },
  ];

  // Suggested next step — 2.4.5
  const suggestions: string[] = [];
  if (riskCounts.high > 0) suggestions.push(copy.suggestions.highRisk(riskCounts.high));
  if (defendedRows === 0 && totalRows > 0) suggestions.push(copy.suggestions.noDefense);
  if (riskCounts.medium > 2) suggestions.push(copy.suggestions.mediumRisk(riskCounts.medium));

  const isEmpty = totalRows === 0;

  return (
    <>
      <div className="workspace-dashboard-layout">
        <div className="workspace-dashboard-main">
      {/* KPI row — with trend indicators 2.4.1 */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCardWithTrend icon="catalog" label={copy.kpis.liveContractsLabel} value={String(activeContracts)} note={copy.kpis.liveContractsNote} trend="flat" />
        <KpiCardWithTrend icon="shield" label={copy.kpis.defendedRowsLabel} value={String(defendedRows)} note={copy.kpis.defendedRowsNote} trend={defendedRows > 0 ? "up" : "flat"} />
        <KpiCardWithTrend icon="chart" label={copy.kpis.avgAucLabel} value={avgAuc} note={copy.kpis.avgAucNote} trend={aucTrend} />
        <KpiCardWithTrend icon="report" label={copy.kpis.defenseEvaluatedLabel} value={String(defendedRows)} note={`${totalRows} ${copy.kpis.defenseEvaluatedNote}`} trend={totalRows > 0 ? "up" : "flat"} />
      </div>

      {/* System progress bar — audit coverage overview */}
      {totalRows > 0 && (
        <WorkspaceSectionCard title={copy.coverageBar.title} className="rounded-lg">
          <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{copy.coverageBar.summaryText(defendedRows, totalRows, activeContracts)}</span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[color:var(--accent-blue)] to-[color:var(--success)] rounded-full transition-all" style={{ width: `${totalRows > 0 ? Math.round((defendedRows / totalRows) * 100) : 0}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--accent-blue)]" />
              <span className="text-muted-foreground">{copy.coverageBar.tracks["black-box"]} <span className="text-foreground font-medium">{table?.rows.filter(r => r.track === "black-box").length ?? 0}{copy.coverageBar.trackCountSuffix}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--warning)]" />
              <span className="text-muted-foreground">{copy.coverageBar.tracks["gray-box"]} <span className="text-foreground font-medium">{table?.rows.filter(r => r.track === "gray-box").length ?? 0}{copy.coverageBar.trackCountSuffix}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
              <span className="text-muted-foreground">{copy.coverageBar.tracks["white-box"]} <span className="text-foreground font-medium">{table?.rows.filter(r => r.track === "white-box").length ?? 0}{copy.coverageBar.trackCountSuffix}</span></span>
            </div>
          </div>
          </div>
        </WorkspaceSectionCard>
      )}

      {/* Empty workspace guidance — 7.2.3 */}
      {isEmpty ? (
        <section className="border border-[color:var(--accent-blue)]/30 bg-[color:var(--accent-blue)]/5 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-blue)]/20">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[color:var(--accent-blue)]" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1">{localeData.emptyWorkspace.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{localeData.emptyWorkspace.description}</p>
              {/* 3-step guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {localeData.emptyWorkspace.steps.map((step) => (
                  <div key={step.step} className="flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-blue)]/20 text-[10px] font-semibold text-[color:var(--accent-blue)]">
                      {step.step}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* CTA */}
              <Link
                href="/workspace/audits/new"
                className="inline-flex items-center gap-1.5 rounded border border-[color:var(--accent-blue)] bg-[color:var(--accent-blue)] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-blue-hover)]"
              >
                {localeData.emptyWorkspace.cta}
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {totalRisk > 0 && (
          <WorkspaceSectionCard
            title={copy.sections.chartTitles.riskRadar}
            actions={<span className="text-xs text-muted-foreground">{radarData.length} {copy.sections.radarDimensionsLabel}</span>}
          >
            <div className="p-2">
              <ChartRiskRadar data={radarData} height={220} />
            </div>
          </WorkspaceSectionCard>
        )}

        <WorkspaceSectionCard title={copy.sections.chartTitles.aucDistribution}>
          <div className="p-3">
            {aucDistData.length > 0 ? (
              <ChartAucDistribution data={aucDistData} />
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                {copy.sections.noAucData}
              </div>
            )}
          </div>
        </WorkspaceSectionCard>

        <WorkspaceSectionCard title={copy.sections.chartTitles.rocCurve}>
          <div className="p-3">
            <ChartRocCurve data={rocData} />
          </div>
        </WorkspaceSectionCard>

        {totalRisk > 0 && (
          <WorkspaceSectionCard title={copy.sections.chartTitles.riskDistribution}>
            <div className="p-3">
              <ChartRiskDistribution data={riskDistData} />
            </div>
          </WorkspaceSectionCard>
        )}

        <WorkspaceSectionCard title={copy.sections.chartTitles.attackComparison}>
          <div className="p-3">
            <ChartAttackComparison data={attackComparisonData} />
          </div>
        </WorkspaceSectionCard>
      </div>

      {/* Main content grid */}
      <div className="grid gap-4">
        {/* Recent results table */}
        <WorkspaceSectionCard title={copy.sections.recentResults}>
          <div className="overflow-auto max-h-[380px]">
            {recentRows.length > 0 ? (
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 bg-muted/30">
                  <tr className="border-b border-border">
                    <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.sections.tableHeaders.risk}</th>
                    <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.sections.tableHeaders.attack}</th>
                    <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.sections.tableHeaders.model}</th>
                    <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.sections.tableHeaders.track}</th>
                    <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">{copy.sections.tableHeaders.auc}</th>
                    <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">{copy.sections.tableHeaders.asr}</th>
                    <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">{copy.sections.tableHeaders.tpr}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRows.map((row, index) => {
                    const auc = parseFloat(row.aucLabel);
                    return (
                    <tr
                      key={`${row.track}-${row.attack}-${row.defense}-${row.model}-${row.aucLabel}-${index}`}
                      className={`table-row-hover border-b border-border transition-colors hover:bg-muted/30 ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/10"
                      }`}
                    >
                      <td className="px-3 py-2">
                        {!isNaN(auc) ? <RiskBadge auc={auc} compact /> : "—"}
                      </td>
                      <td className="px-3 py-2 font-medium">{row.attack}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.model}</td>
                      <td className="px-3 py-2">
                        <StatusBadge tone="info">{row.track}</StatusBadge>
                      </td>
                      <td className="mono px-3 py-2 text-right">{row.aucLabel}</td>
                      <td className="mono px-3 py-2 text-right">{row.asrLabel}</td>
                      <td className="mono px-3 py-2 text-right">{row.tprLabel}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                {copy.emptyResults}
              </div>
            )}
          </div>
        </WorkspaceSectionCard>

      </div>
        </div>

        <aside className="workspace-inspector-stack">
          <section className="workspace-inspector-card">
            <div className="workspace-inspector-card-header">
              <h2>{copy.sections.suggestedNextSteps}</h2>
            </div>
            <div className="space-y-3 p-4">
              {(suggestions.length > 0 ? suggestions : copy.todoItems).slice(0, 3).map((item, index) => (
                <div key={`${item}-${index}`} className="workspace-action-row">
                  <span className="workspace-action-icon">{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="workspace-inspector-card">
            <div className="workspace-inspector-card-header">
              <h2>{copy.sections.tasks}</h2>
            </div>
            <div className="space-y-3 p-4">
              {copy.todoItems.map((item, index) => (
                <div key={item} className="workspace-task-progress">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mono text-[11px] text-muted-foreground">{index + 1}</div>
                      <p>{item}</p>
                    </div>
                    <span>{index === 0 ? "65%" : index === 1 ? "30%" : "—"}</span>
                  </div>
                  {index < 2 ? (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full rounded-full bg-[var(--accent-blue)]"
                        style={{ width: index === 0 ? "65%" : "30%" }}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

export default async function WorkspaceHomePage() {
  return renderWorkspaceHomePage();
}

type WorkspaceHomePageOptions = {
  locale?: Locale;
};

async function renderWorkspaceHomePage({ locale }: WorkspaceHomePageOptions = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].workspace;

  return (
    <WorkspacePageFrame
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      titleClassName="text-xl"
      descriptionClassName="text-sm"
    >
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
    </WorkspacePageFrame>
  );
}
