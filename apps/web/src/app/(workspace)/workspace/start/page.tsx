import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, ChevronRight, Info } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { ClickableRow } from "@/components/clickable-row";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { StatusBadge } from "@/components/status-badge";
import { RiskBadge } from "@/components/risk-badge";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { KpiRowSkeleton, TableSkeleton } from "@/components/skeleton";
import { classifyRisk } from "@/lib/risk-report";
import { ChartAucDistribution } from "@/components/chart-auc-distribution";
import { ChartRocCurve } from "@/components/chart-roc-curve";
import { ChartRiskRadar } from "@/components/chart-risk-radar";
import { WorkspacePageFrame, WorkspaceSectionCard } from "@/components/workspace-frame";
import { MetricTooltip } from "@/components/metric-tooltip";
import { InfoTooltip } from "@/components/info-tooltip";
import { AnimatedValue } from "@/components/animated-value";
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

/** KPI card with trend arrow (up/down/flat) and animated count-up — 2.4.1, clickable drill-down */
function KpiCardWithTrend({ label, value, note, trend, trendValue, alert, href, ariaLabel }: { label: React.ReactNode; value: string; note: string; trend?: "up" | "down" | "flat"; trendValue?: string; alert?: "danger" | "warning" | "info" | null; href?: string; ariaLabel?: string }) {
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : null;
  const trendColor = trend === "up" ? "text-[var(--warning)]" : trend === "down" ? "text-[var(--success)]" : "text-muted-foreground";
  const trendLabel = trend === "up" ? "trending up" : trend === "down" ? "trending down" : "stable";
  const alertBg = alert === "danger" ? "bg-[var(--risk-high)]/[0.03]" : alert === "warning" ? "bg-[var(--warning)]/[0.03]" : "";
  const content = (
    <>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <AnimatedValue value={value} className={`text-xl font-bold leading-none ${alert === "danger" ? "text-[var(--risk-high)]" : ""}`} />
        {trendIcon ? (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${trendColor}`} aria-label={trendLabel} role="img">
            {trendIcon}
            {trendValue && <span>{trendValue}</span>}
          </span>
        ) : null}
        {alert === "danger" && <span className="text-base text-[var(--risk-high)]" role="img" aria-label="needs attention">!</span>}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground leading-tight">{note}</p>
      {href && (
        <ChevronRight
          size={14}
          strokeWidth={1.5}
          className="absolute top-3 right-3 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        role="link"
        aria-label={ariaLabel}
        className={`group relative rounded-2xl border border-border bg-card p-3 transition-all duration-200 hover:shadow-md hover:border-[var(--accent-blue)]/30 hover:-translate-y-px cursor-pointer ${alertBg}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`rounded-2xl border border-border bg-card p-3 ${alertBg}`}>
      {content}
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
  let aucTrendValue = "";
  if (allAuc.length >= 10) {
    const recent = allAuc.slice(0, 5);
    const previous = allAuc.slice(5, 10);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
    const delta = recentAvg - previousAvg;
    aucTrend = delta > 0.02 ? "up" : delta < -0.02 ? "down" : "flat";
    if (aucTrend !== "flat" && previousAvg > 0) {
      const pctChange = Math.abs((delta / previousAvg) * 100);
      aucTrendValue = `${pctChange.toFixed(1)}%`;
    }
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

  const isEmpty = totalRows === 0;

  const defenseRate = totalRows > 0 ? defendedRows / totalRows : 1;
  const avgAucAlert = avgAuc !== "n/a" && parseFloat(avgAuc) > 0.85;

  const defensePct = Math.round(defenseRate * 100);

  // Composite Privacy Health Score (0-100)
  const healthAucNum = aucValues.length > 0 ? parseFloat(avgAuc) : 0;
  const aucPenalty = healthAucNum > 0.5 ? (healthAucNum - 0.5) * 40 : 0;
  const highRiskPenalty = totalRisk > 0 ? (riskCounts.high / totalRisk) * 25 : 0;
  const defenseBonus = defenseRate * 15;
  const rawScore = totalRows > 0 ? Math.max(0, Math.min(100, Math.round(100 - aucPenalty - highRiskPenalty + defenseBonus))) : -1;
  const healthScoreLabel = locale === "zh-CN" ? "隐私健康指数" : "Privacy Health Score";
  const healthScoreColor = rawScore >= 80 ? "var(--success)" : rawScore >= 60 ? "var(--warning)" : rawScore >= 0 ? "var(--risk-high)" : "var(--muted-foreground)";
  const healthScoreText = rawScore >= 80 ? (locale === "zh-CN" ? "良好" : "Good") : rawScore >= 60 ? (locale === "zh-CN" ? "需关注" : "Needs attention") : rawScore >= 0 ? (locale === "zh-CN" ? "高风险" : "At risk") : (locale === "zh-CN" ? "暂无数据" : "No data");

  return (
    <>
      <div className="workspace-overview-hero">
        <div className="workspace-overview-summary">
          {totalRows > 0 && (
            <div className="workspace-health-card card-animate">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="var(--muted)" strokeWidth="4" opacity="0.3" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke={healthScoreColor} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(rawScore / 100) * 150.8} 150.8`} className="transition-all duration-1000" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-base font-bold" style={{ color: healthScoreColor }}>{rawScore >= 0 ? rawScore : "--"}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{healthScoreLabel}</div>
                <div className="mt-0.5 text-sm font-medium" style={{ color: healthScoreColor }}>{healthScoreText}</div>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-4">
                  {locale === "zh-CN"
                    ? `${totalRows} 项评估 · 平均 AUC ${avgAuc} · ${defensePct}% 已防御`
                    : `${totalRows} evaluations · avg AUC ${avgAuc} · ${defensePct}% defended`}
                </p>
              </div>
            </div>
          )}
          <div className="workspace-kpi-grid">
            <KpiCardWithTrend label={copy.kpis.liveContractsLabel} value={String(activeContracts)} note={copy.kpis.liveContractsNote} trend="flat" href="/workspace/audits" ariaLabel={`${copy.kpis.liveContractsLabel} — ${copy.kpis.liveContractsNote}`} />
            <KpiCardWithTrend label={copy.kpis.defendedRowsLabel} value={String(defendedRows)} note={copy.kpis.defendedRowsNote} trend={defendedRows > 0 ? "up" : "flat"} alert={defenseRate < 0.5 ? "warning" : null} href="/workspace/risk-findings" ariaLabel={`${copy.kpis.defendedRowsLabel} — ${copy.kpis.defendedRowsNote}`} />
            <KpiCardWithTrend label={<InfoTooltip content={localeData.tooltips.auc}>{copy.kpis.avgAucLabel}</InfoTooltip>} value={avgAuc} note={copy.kpis.avgAucNote} trend={aucTrend} trendValue={aucTrendValue} alert={avgAucAlert ? "danger" : null} href="/workspace/risk-findings" ariaLabel={`${copy.kpis.avgAucLabel} — ${copy.kpis.avgAucNote}`} />
            <KpiCardWithTrend label={copy.kpis.defenseEvaluatedLabel} value={String(totalRows)} note={`${totalRows} ${copy.kpis.defenseEvaluatedNote}`} trend={totalRows > 0 ? "up" : "flat"} alert={riskCounts.high > 0 ? "danger" : null} href="/workspace/reports" ariaLabel={`${copy.kpis.defenseEvaluatedLabel} — ${totalRows} ${copy.kpis.defenseEvaluatedNote}`} />
          </div>
        </div>
        {totalRows > 0 && (
          <WorkspaceSectionCard
            title={copy.sections.chartTitles.riskRadar}
            actions={<span className="text-xs text-muted-foreground">{radarData.length} {copy.sections.radarDimensionsLabel}</span>}
            className="workspace-overview-radar chart-animate"
          >
            <div className="px-4 py-2">
              <ChartRiskRadar data={radarData} height={184} />
            </div>
          </WorkspaceSectionCard>
        )}
      </div>

      {/* Empty workspace guidance — 7.2.3 */}
      {isEmpty ? (
        <section className="border border-[var(--accent-blue)]/30 bg-[var(--accent-blue)]/5 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/20">
              <Info size={16} strokeWidth={1.5} className="text-[var(--accent-blue)]" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1">{localeData.emptyWorkspace.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{localeData.emptyWorkspace.description}</p>
              {/* 3-step guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                {localeData.emptyWorkspace.steps.map((step) => (
                  <div key={step.step} className="flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/20 text-[10px] font-semibold text-[var(--accent-blue)]">
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--accent-blue)] bg-[var(--accent-blue)] px-4 py-2 text-xs font-medium text-background transition-colors hover:bg-[var(--accent-blue-hover)]"
              >
                {localeData.emptyWorkspace.cta}
                <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {(totalRisk > 0 || totalRows > 0) && (
        <div className="workspace-risk-coverage-row">
          {totalRisk > 0 && (
            <div className="workspace-risk-strip">
            <Link href="/workspace/risk-findings?severity=high" className="group rounded-2xl border border-border bg-[var(--risk-high)]/[0.035] p-3 transition-colors hover:bg-[var(--risk-high)]/[0.055]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {copy.sections.riskLabels.high}
              </div>
              <div className="mt-1.5 text-2xl font-semibold leading-none">{riskCounts.high}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-tight">
                {copy.riskInterpretations.high}
              </p>
            </Link>
            <Link href="/workspace/risk-findings?severity=medium" className="group rounded-2xl border border-border bg-[var(--risk-medium)]/[0.035] p-3 transition-colors hover:bg-[var(--risk-medium)]/[0.055]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {copy.sections.riskLabels.medium}
              </div>
              <div className="mt-1.5 text-2xl font-semibold leading-none">{riskCounts.medium}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-tight">
                {copy.riskInterpretations.medium}
              </p>
            </Link>
            <Link href="/workspace/risk-findings?severity=low" className="group rounded-2xl border border-border bg-[var(--risk-low)]/[0.035] p-3 transition-colors hover:bg-[var(--risk-low)]/[0.055]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {copy.sections.riskLabels.low}
              </div>
              <div className="mt-1.5 text-2xl font-semibold leading-none">{riskCounts.low}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-tight">
                {copy.riskInterpretations.low}
              </p>
            </Link>
            </div>
          )}

          {totalRows > 0 && (
            <section className="workspace-coverage-compact">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[13px] font-bold">{copy.coverageBar.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{copy.coverageBar.summaryText(defendedRows, totalRows, activeContracts)}</p>
                </div>
                <div className="mono text-xl font-semibold">{defensePct}%</div>
              </div>
              <div className="mt-3 h-2 bg-muted/30 rounded-full overflow-hidden" role="progressbar" aria-valuenow={defensePct} aria-valuemin={0} aria-valuemax={100} aria-label={copy.coverageBar.summaryText(defendedRows, totalRows, activeContracts)}>
                <div className="h-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--success)] rounded-full transition-all" style={{ width: `${defensePct}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--track-black)]" aria-hidden="true" />
                  <span className="text-muted-foreground">{copy.coverageBar.tracks["black-box"]} <span className="text-foreground font-medium">{table?.rows.filter(r => r.track === "black-box").length ?? 0}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--track-gray)]" aria-hidden="true" />
                  <span className="text-muted-foreground">{copy.coverageBar.tracks["gray-box"]} <span className="text-foreground font-medium">{table?.rows.filter(r => r.track === "gray-box").length ?? 0}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--track-white)]" aria-hidden="true" />
                  <span className="text-muted-foreground">{copy.coverageBar.tracks["white-box"]} <span className="text-foreground font-medium">{table?.rows.filter(r => r.track === "white-box").length ?? 0}</span></span>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <WorkspaceSectionCard title={copy.sections.chartTitles.aucDistribution} className="chart-animate">
          <div className="p-4">
            {aucDistData.length > 0 ? (
              <ChartAucDistribution data={aucDistData} />
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                {copy.sections.noAucData}
              </div>
            )}
          </div>
        </WorkspaceSectionCard>

        <WorkspaceSectionCard title={`${copy.sections.chartTitles.rocCurve}${aucValues.length > 0 ? copy.sections.chartTitles.syntheticSuffix : ""}`} className="chart-animate">
          <div className="p-4">
            {aucValues.length > 0 ? (
              <ChartRocCurve data={rocData} />
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                {copy.sections.noAucData}
              </div>
            )}
          </div>
        </WorkspaceSectionCard>

      </div>

      {/* Main content grid */}
      <div className="grid gap-4">
        {/* Recent results table */}
        <WorkspaceSectionCard title={copy.sections.recentResults}>
          <div className="overflow-auto max-h-[380px]">
            {recentRows.length > 0 ? (
              <table className="w-full border-collapse text-[13px]">
                <thead className="sticky top-0 bg-muted/30">
                  <tr className="border-b border-border">
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{copy.sections.tableHeaders.risk}</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{copy.sections.tableHeaders.attack}</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{copy.sections.tableHeaders.model}</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">{copy.sections.tableHeaders.track}</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground"><MetricTooltip term="auc" locale={locale} mode="icon">{copy.sections.tableHeaders.auc}</MetricTooltip></th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground"><MetricTooltip term="asr" locale={locale} mode="icon">{copy.sections.tableHeaders.asr}</MetricTooltip></th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground"><MetricTooltip term="tpr" locale={locale} mode="icon">{copy.sections.tableHeaders.tpr}</MetricTooltip></th>
                  </tr>
                </thead>
                <tbody>
                  {recentRows.map((row, index) => {
                    const auc = parseFloat(row.aucLabel);
                    return (
                    <ClickableRow
                      key={`${row.track}-${row.attack}-${row.defense}-${row.model}-${row.aucLabel}-${index}`}
                      href={`/workspace/risk-findings?model=${encodeURIComponent(row.model)}`}
                      className="table-row-hover border-b border-border transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-3">
                        {!isNaN(auc) ? <RiskBadge auc={auc} compact /> : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">{row.attack}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.model}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone="info">{row.track}</StatusBadge>
                      </td>
                      <td className="mono px-4 py-3 text-right">{row.aucLabel}</td>
                      <td className="mono px-4 py-3 text-right">{row.asrLabel}</td>
                      <td className="mono px-4 py-3 text-right">{row.tprLabel}</td>
                    </ClickableRow>
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
      title={copy.title}
      titleClassName="text-xl"
      descriptionClassName="text-sm"
    >
      <Suspense fallback={
        <>
          <KpiRowSkeleton />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 border border-border bg-card">
              <TableSkeleton rows={10} cols={6} />
            </div>
            <div className="border border-border bg-card">
              <div className="p-4 space-y-3">
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
