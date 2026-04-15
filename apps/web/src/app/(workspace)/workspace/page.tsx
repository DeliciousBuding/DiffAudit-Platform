import { Suspense } from "react";
import { headers } from "next/headers";

import { type Locale } from "@/components/language-picker";
import { fetchAttackDefenseTable } from "@/lib/attack-defense-table";
import { fetchCatalogDashboard } from "@/lib/catalog";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { StatusBadge } from "@/components/status-badge";
import { RiskBadge } from "@/components/risk-badge";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { KpiRowSkeleton, TableSkeleton } from "@/components/skeleton";
import { classifyRisk, riskLabel } from "@/lib/risk-report";
import { ChartAucDistribution } from "@/components/chart-auc-distribution";
import { ChartRocCurve } from "@/components/chart-roc-curve";
import { ChartRiskDistribution } from "@/components/chart-risk-distribution";
import { ChartAttackComparison } from "@/components/chart-attack-comparison";
import { ChartRiskRadar } from "@/components/chart-risk-radar";

// Cache RSC responses for 60s — demo data doesn't change during a session
export const revalidate = 60;

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

function KpiCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold leading-none">{value}</div>
      <p className="mt-1.5 text-xs text-muted-foreground leading-tight">{note}</p>
    </div>
  );
}

/** KPI card with trend arrow (up/down/flat) — 2.4.1 */
function KpiCardWithTrend({ label, value, note, trend }: { label: string; value: string; note: string; trend?: "up" | "down" | "flat" }) {
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const trendColor = trend === "up" ? "text-[color:var(--warning)]" : trend === "down" ? "text-[color:var(--success)]" : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-semibold leading-none">{value}</span>
        {trend && <span className={`text-base ${trendColor}`}>{trendIcon}</span>}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground leading-tight">{note}</p>
    </div>
  );
}

/** Async server component that fetches and renders the KPI + table data */
async function WorkspaceData({ locale }: { locale: Locale }) {
  const localeData = WORKSPACE_COPY[locale];
  const copy = localeData.workspace;
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
      {/* KPI row — with trend indicators 2.4.1 */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KpiCardWithTrend label={copy.kpis.liveContractsLabel} value={String(activeContracts)} note={copy.kpis.liveContractsNote} trend="flat" />
        <KpiCardWithTrend label={copy.kpis.defendedRowsLabel} value={String(defendedRows)} note={copy.kpis.defendedRowsNote} trend={defendedRows > 0 ? "up" : "flat"} />
        <KpiCardWithTrend label={copy.kpis.avgAucLabel} value={avgAuc} note={copy.kpis.avgAucNote} trend={aucTrend} />
        <KpiCardWithTrend label={copy.kpis.defenseEvaluatedLabel} value={String(defendedRows)} note={`${totalRows} ${copy.kpis.defenseEvaluatedNote}`} trend={totalRows > 0 ? "up" : "flat"} />
      </div>

      {/* Audit track quick-access cards — Platform Boost */}
      <div className="grid gap-3 md:grid-cols-3">
        <a href="/workspace/audits/new" className="group rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-[color:var(--accent-blue)]/40" aria-label={`${copy.auditTracks.blackBoxTitle} - ${copy.auditTracks.createAudit}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--accent-blue)]/10 text-[10px] font-bold text-[color:var(--accent-blue)]" aria-hidden="true">1</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.auditTracks.blackBoxLabel}</span>
            <span className="ml-auto rounded-full bg-[color:var(--warning)]/10 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--warning)]">{copy.riskBadgeLabels.high}</span>
          </div>
          <h3 className="text-base font-semibold mb-1.5 group-hover:text-[color:var(--accent-blue)] transition-colors">{copy.auditTracks.blackBoxTitle}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{copy.auditTracks.blackBoxDesc}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-[color:var(--accent-blue)] font-medium">
            {copy.auditTracks.createAudit}
            <svg viewBox="0 0 24 24" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        <a href="/workspace/audits/new" className="group rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-[color:var(--accent-blue)]/40" aria-label={`${copy.auditTracks.grayBoxTitle} - ${copy.auditTracks.createAudit}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--warning)]/10 text-[10px] font-bold text-[color:var(--warning)]" aria-hidden="true">2</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.auditTracks.grayBoxLabel}</span>
            <span className="ml-auto rounded-full bg-[color:var(--warning)]/10 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--warning)]">{copy.riskBadgeLabels.high}</span>
          </div>
          <h3 className="text-base font-semibold mb-1.5 group-hover:text-[color:var(--warning)] transition-colors">{copy.auditTracks.grayBoxTitle}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{copy.auditTracks.grayBoxDesc}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-[color:var(--accent-blue)] font-medium">
            {copy.auditTracks.createAudit}
            <svg viewBox="0 0 24 24" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        <a href="/workspace/audits/new" className="group rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-[color:var(--accent-blue)]/40" aria-label={`${copy.auditTracks.whiteBoxTitle} - ${copy.auditTracks.createAudit}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--success)]/10 text-[10px] font-bold text-[color:var(--success)]" aria-hidden="true">3</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.auditTracks.whiteBoxLabel}</span>
            <span className="ml-auto rounded-full bg-[color:var(--risk-high)]/10 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--risk-high)]">{copy.riskBadgeLabels.critical}</span>
          </div>
          <h3 className="text-base font-semibold mb-1.5 group-hover:text-[color:var(--success)] transition-colors">{copy.auditTracks.whiteBoxTitle}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{copy.auditTracks.whiteBoxDesc}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-[color:var(--accent-blue)] font-medium">
            {copy.auditTracks.createAudit}
            <svg viewBox="0 0 24 24" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </a>
      </div>

      {/* System progress bar — audit coverage overview */}
      {totalRows > 0 && (
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-foreground">{copy.coverageBar.title}</h2>
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
        </section>
      )}

      {/* Empty workspace guidance — Task 3.1 optimized */}
      {isEmpty ? (
        <section className="border-2 border-[color:var(--accent-blue)]/40 bg-gradient-to-br from-[color:var(--accent-blue)]/8 to-[color:var(--accent-blue)]/3 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--accent-blue)]/15 mb-4">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-[color:var(--accent-blue)]" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">{localeData.emptyWorkspace.title}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xl">{localeData.emptyWorkspace.description}</p>

            {/* 3-step guide with enhanced visual hierarchy */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 w-full">
              {localeData.emptyWorkspace.steps.map((step, idx) => (
                <div key={step.step} className="relative flex flex-col items-center text-center p-4 rounded-lg bg-card/50 border border-border/50 hover:border-[color:var(--accent-blue)]/30 transition-colors">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent-blue)] text-sm font-bold text-white mb-3 shadow-sm">
                    {step.step}
                  </span>
                  <div className="text-sm font-semibold mb-1.5 text-foreground">{step.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{step.desc}</div>
                  {idx < 2 && (
                    <svg viewBox="0 0 24 24" className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>

            {/* Enhanced CTA button */}
            <a
              href="/workspace/audits/new"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-[color:var(--accent-blue)] bg-[color:var(--accent-blue)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 hover:bg-[color:var(--accent-blue)]/90"
            >
              {localeData.emptyWorkspace.cta}
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </section>
      ) : (
        /* Suggested next step — 2.4.5 */
        suggestions.length > 0 && (
          <section className="border border-[color:var(--accent-blue)]/30 bg-[color:var(--accent-blue)]/5 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[color:var(--accent-blue)] mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-blue)] mb-1">
                  {copy.sections.suggestedNextSteps}
                </h3>
                <ul className="space-y-1">
                  {suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )
      )}

      {/* Risk distribution */}
      {totalRisk > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="grid gap-3 grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4 border-l-[3px] border-l-[var(--risk-high)]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {copy.sections.riskLabels.high}
              </div>
              <div className="mt-1.5 text-2xl font-semibold leading-none">{riskCounts.high}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-tight">
                {copy.riskInterpretations.high}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 border-l-[3px] border-l-[var(--risk-medium)]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {copy.sections.riskLabels.medium}
              </div>
              <div className="mt-1.5 text-2xl font-semibold leading-none">{riskCounts.medium}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-tight">
                {copy.riskInterpretations.medium}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 border-l-[3px] border-l-[var(--risk-low)]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {copy.sections.riskLabels.low}
              </div>
              <div className="mt-1.5 text-2xl font-semibold leading-none">{riskCounts.low}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-tight">
                {copy.riskInterpretations.low}
              </p>
            </div>
          </div>

          {/* Risk Radar — 7.1 */}
          <section className="border border-border bg-card">
            <div className="border-b border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
              <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {copy.sections.chartTitles.riskRadar}
              </h2>
              <span className="text-xs text-muted-foreground">
                {radarData.length} {copy.sections.radarDimensionsLabel}
              </span>
            </div>
            <div className="p-2">
              <ChartRiskRadar data={radarData} height={220} />
            </div>
          </section>
        </div>
      )}

      {/* Charts grid */}
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.chartTitles.aucDistribution}
            </h2>
          </div>
          <div className="p-3">
            {aucDistData.length > 0 ? (
              <ChartAucDistribution data={aucDistData} />
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                {copy.sections.noAucData}
              </div>
            )}
          </div>
        </section>

        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.chartTitles.rocCurve}
            </h2>
          </div>
          <div className="p-3">
            <ChartRocCurve data={rocData} />
          </div>
        </section>

        {totalRisk > 0 && (
          <section className="border border-border bg-card">
            <div className="border-b border-border bg-muted/20 px-3 py-2">
              <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {copy.sections.chartTitles.riskDistribution}
              </h2>
            </div>
            <div className="p-3">
              <ChartRiskDistribution data={riskDistData} />
            </div>
          </section>
        )}

        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.chartTitles.attackComparison}
            </h2>
          </div>
          <div className="p-3">
            <ChartAttackComparison data={attackComparisonData} />
          </div>
        </section>
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
                <thead className="sticky top-0 z-10 bg-muted/30">
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
                      key={`${row.track}-${row.attack}-${row.defense}`}
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
                <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
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
        <h1 className="mt-1 text-xl font-semibold">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
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
