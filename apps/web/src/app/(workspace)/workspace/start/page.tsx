import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, ChevronRight, Info } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { StatusBadge } from "@/components/status-badge";
import { RiskBadge } from "@/components/risk-badge";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { KpiRowSkeleton, TableSkeleton } from "@/components/skeleton";
import { classifyRisk } from "@/lib/risk-report";
import { ChartAucDistribution } from "@/components/chart-auc-distribution";
import { ChartRocCurve } from "@/components/chart-roc-curve";
import { InteractiveRiskDistribution } from "@/components/chart-risk-distribution";
import { ChartAttackComparison } from "@/components/chart-attack-comparison";
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
function KpiCardWithTrend({ label, value, note, trend, alert, href, ariaLabel }: { label: React.ReactNode; value: string; note: string; trend?: "up" | "down" | "flat"; alert?: "danger" | "warning" | "info" | null; href?: string; ariaLabel?: string }) {
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : null;
  const trendColor = trend === "up" ? "text-[color:var(--warning)]" : trend === "down" ? "text-[color:var(--success)]" : "text-muted-foreground";
  const trendLabel = trend === "up" ? "trending up" : trend === "down" ? "trending down" : "stable";
  const alertBorder = alert === "danger" ? "border-l-2 border-l-[var(--risk-high)]" : alert === "warning" ? "border-l-2 border-l-[var(--warning)]" : alert === "info" ? "border-l-2 border-l-[var(--accent-blue)]" : "";
  const alertBg = alert === "danger" ? "bg-[color:var(--risk-high)]/[0.03]" : alert === "warning" ? "bg-[color:var(--warning)]/[0.03]" : "";
  const content = (
    <>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <AnimatedValue value={value} className={`text-2xl font-bold leading-none ${alert === "danger" ? "text-[color:var(--risk-high)]" : ""}`} />
        {trendIcon ? <span className={`text-base ${trendColor}`} aria-label={trendLabel} role="img">{trendIcon}</span> : null}
        {alert === "danger" && <span className="text-base text-[color:var(--risk-high)]" role="img" aria-label="needs attention">!</span>}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground leading-tight">{note}</p>
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
        className={`group relative rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-[color:var(--accent-blue)]/30 hover:-translate-y-px cursor-pointer ${alertBorder} ${alertBg}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`rounded-2xl border border-border bg-card p-4 ${alertBorder} ${alertBg}`}>
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
  const dataFetchedAt = new Date();

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

  // Compute attack comparison from real data — group by attack family
  const attackFamilyMap: Record<string, { aucSum: number; count: number }> = {};
  for (const row of table?.rows ?? []) {
    const auc = parseFloat(row.aucLabel);
    if (isNaN(auc)) continue;
    const family = row.attack.toLowerCase();
    if (!attackFamilyMap[family]) {
      attackFamilyMap[family] = { aucSum: 0, count: 0 };
    }
    attackFamilyMap[family].aucSum += auc;
    attackFamilyMap[family].count++;
  }
  const hasAttackData = Object.keys(attackFamilyMap).length > 0;
  const attackComparisonData = hasAttackData
    ? [
        {
          dimension: "AUC",
          ...Object.fromEntries(
            Object.entries(attackFamilyMap).map(([family, { aucSum, count }]) => [
              family.charAt(0).toUpperCase() + family.slice(1),
              count > 0 ? parseFloat((aucSum / count).toFixed(3)) : 0,
            ]),
          ),
        },
      ]
    : [];

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

  const defenseRate = totalRows > 0 ? defendedRows / totalRows : 1;
  const avgAucAlert = avgAuc !== "n/a" && parseFloat(avgAuc) > 0.85;

  // Per-track evaluation counts
  const allRows = table?.rows ?? [];
  const trackCounts = {
    "black-box": allRows.filter((r) => r.track === "black-box").length,
    "gray-box": allRows.filter((r) => r.track === "gray-box").length,
    "white-box": allRows.filter((r) => r.track === "white-box").length,
  };
  const tcs = locale === "zh-CN" ? " 项评估" : " evals";

  // System health summary
  const healthStatus = riskCounts.high > 0
    ? { tone: "warning" as const, icon: "⚠" as const, text: locale === "zh-CN" ? `${riskCounts.high} 项高危发现需要关注` : `${riskCounts.high} high-risk findings need attention` }
    : totalRows > 0
      ? { tone: "success" as const, icon: "✓" as const, text: locale === "zh-CN" ? `系统健康 · ${totalRows} 项评估完成 · 防御率 ${Math.round(defenseRate * 100)}%` : `Systems healthy · ${totalRows} evaluations · ${Math.round(defenseRate * 100)}% defense rate` }
      : null;

  return (
    <>
      {/* KPI row — with trend indicators 2.4.1, clickable drill-down */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCardWithTrend label={copy.kpis.liveContractsLabel} value={String(activeContracts)} note={copy.kpis.liveContractsNote} trend="flat" href="/workspace/audits" ariaLabel={`${copy.kpis.liveContractsLabel} — ${copy.kpis.liveContractsNote}`} />
        <KpiCardWithTrend label={copy.kpis.defendedRowsLabel} value={String(defendedRows)} note={copy.kpis.defendedRowsNote} trend={defendedRows > 0 ? "up" : "flat"} alert={defenseRate < 0.5 ? "warning" : null} href="/workspace/risk-findings" ariaLabel={`${copy.kpis.defendedRowsLabel} — ${copy.kpis.defendedRowsNote}`} />
        <KpiCardWithTrend label={<InfoTooltip content={localeData.tooltips.auc}>{copy.kpis.avgAucLabel}</InfoTooltip>} value={avgAuc} note={copy.kpis.avgAucNote} trend={aucTrend} alert={avgAucAlert ? "danger" : null} href="/workspace/risk-findings" ariaLabel={`${copy.kpis.avgAucLabel} — ${copy.kpis.avgAucNote}`} />
        <KpiCardWithTrend label={copy.kpis.defenseEvaluatedLabel} value={String(totalRows)} note={`${totalRows} ${copy.kpis.defenseEvaluatedNote}`} trend={totalRows > 0 ? "up" : "flat"} alert={riskCounts.high > 0 ? "danger" : null} href="/workspace/reports" ariaLabel={`${copy.kpis.defenseEvaluatedLabel} — ${totalRows} ${copy.kpis.defenseEvaluatedNote}`} />
      </div>
      <div className="text-[11px] text-muted-foreground/50 text-right">
        {locale === "zh-CN" ? `数据更新于 ${dataFetchedAt.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}` : `Data updated ${dataFetchedAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
      </div>

      {/* System health summary */}
      {healthStatus && (
        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-[13px] ${
          healthStatus.tone === "warning"
            ? "border-[color:var(--warning)]/30 bg-[color:var(--warning)]/5 text-[color:var(--warning)]"
            : "border-[color:var(--success)]/30 bg-[color:var(--success)]/5 text-[color:var(--success)]"
        }`}>
          <span className="text-sm" aria-hidden="true">{healthStatus.icon}</span>
          <span className="font-medium">{healthStatus.text}</span>
        </div>
      )}

      {/* Audit track quick-access cards — Platform Boost */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/workspace/audits/new?track=black-box" className="group rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-[color:var(--accent-blue)]/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--accent-blue)]/10 text-[10px] font-bold text-[color:var(--accent-blue)]">1</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.auditTracks.blackBoxLabel}</span>
            {trackCounts["black-box"] > 0 && (
              <span className="ml-auto text-[10px] text-muted-foreground">{trackCounts["black-box"]}{tcs}</span>
            )}
            <span className={`rounded-full bg-[color:var(--warning)]/10 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--warning)]${trackCounts["black-box"] > 0 ? "" : " ml-auto"}`}>{copy.riskBadgeLabels.high}</span>
          </div>
          <h3 className="text-base font-semibold mb-1.5 group-hover:text-[color:var(--accent-blue)] transition-colors">{copy.auditTracks.blackBoxTitle}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{copy.auditTracks.blackBoxDesc}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-[color:var(--accent-blue)] font-medium">
            {copy.auditTracks.createAudit}
            <ArrowRight size={12} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
        </Link>

        <Link href="/workspace/audits/new?track=gray-box" className="group rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-[color:var(--accent-blue)]/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--warning)]/10 text-[10px] font-bold text-[color:var(--warning)]">2</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.auditTracks.grayBoxLabel}</span>
            {trackCounts["gray-box"] > 0 && (
              <span className="ml-auto text-[10px] text-muted-foreground">{trackCounts["gray-box"]}{tcs}</span>
            )}
            <span className={`rounded-full bg-[color:var(--warning)]/10 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--warning)]${trackCounts["gray-box"] > 0 ? "" : " ml-auto"}`}>{copy.riskBadgeLabels.high}</span>
          </div>
          <h3 className="text-base font-semibold mb-1.5 group-hover:text-[color:var(--warning)] transition-colors">{copy.auditTracks.grayBoxTitle}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{copy.auditTracks.grayBoxDesc}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-[color:var(--accent-blue)] font-medium">
            {copy.auditTracks.createAudit}
            <ArrowRight size={12} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
        </Link>

        <Link href="/workspace/audits/new?track=white-box" className="group rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-[color:var(--accent-blue)]/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--success)]/10 text-[10px] font-bold text-[color:var(--success)]">3</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.auditTracks.whiteBoxLabel}</span>
            {trackCounts["white-box"] > 0 && (
              <span className="ml-auto text-[10px] text-muted-foreground">{trackCounts["white-box"]}{tcs}</span>
            )}
            <span className={`rounded-full bg-[color:var(--risk-high)]/10 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--risk-high)]${trackCounts["white-box"] > 0 ? "" : " ml-auto"}`}>{copy.riskBadgeLabels.critical}</span>
          </div>
          <h3 className="text-base font-semibold mb-1.5 group-hover:text-[color:var(--success)] transition-colors">{copy.auditTracks.whiteBoxTitle}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{copy.auditTracks.whiteBoxDesc}</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-[color:var(--accent-blue)] font-medium">
            {copy.auditTracks.createAudit}
            <ArrowRight size={12} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
        </Link>
      </div>

      {/* System progress bar — audit coverage overview */}
      {totalRows > 0 && (
        <WorkspaceSectionCard title={copy.coverageBar.title}>
          <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{copy.coverageBar.summaryText(defendedRows, totalRows, activeContracts)}</span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden" role="progressbar" aria-valuenow={totalRows > 0 ? Math.round((defendedRows / totalRows) * 100) : 0} aria-valuemin={0} aria-valuemax={100} aria-label={copy.coverageBar.summaryText(defendedRows, totalRows, activeContracts)}>
            <div className="h-full bg-gradient-to-r from-[color:var(--accent-blue)] to-[color:var(--success)] rounded-full transition-all" style={{ width: `${totalRows > 0 ? Math.round((defendedRows / totalRows) * 100) : 0}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--track-black)]" aria-hidden="true" />
              <span className="text-muted-foreground">{copy.coverageBar.tracks["black-box"]} <span className="text-foreground font-medium">{table?.rows.filter(r => r.track === "black-box").length ?? 0}{copy.coverageBar.trackCountSuffix}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--track-gray)]" aria-hidden="true" />
              <span className="text-muted-foreground">{copy.coverageBar.tracks["gray-box"]} <span className="text-foreground font-medium">{table?.rows.filter(r => r.track === "gray-box").length ?? 0}{copy.coverageBar.trackCountSuffix}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--track-white)]" aria-hidden="true" />
              <span className="text-muted-foreground">{copy.coverageBar.tracks["white-box"]} <span className="text-foreground font-medium">{table?.rows.filter(r => r.track === "white-box").length ?? 0}{copy.coverageBar.trackCountSuffix}</span></span>
            </div>
          </div>
          </div>
        </WorkspaceSectionCard>
      )}

      {/* Empty workspace guidance — 7.2.3 */}
      {isEmpty ? (
        <section className="border border-[color:var(--accent-blue)]/30 bg-[color:var(--accent-blue)]/5 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-blue)]/20">
              <Info size={16} strokeWidth={1.5} className="text-[color:var(--accent-blue)]" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1">{localeData.emptyWorkspace.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{localeData.emptyWorkspace.description}</p>
              {/* 3-step guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
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
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[color:var(--accent-blue)] bg-[color:var(--accent-blue)] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-blue-hover)]"
              >
                {localeData.emptyWorkspace.cta}
                <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        /* Suggested next step — 2.4.5 */
        suggestions.length > 0 && (
          <section className="border border-[color:var(--accent-blue)]/30 bg-[color:var(--accent-blue)]/5 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Info size={16} strokeWidth={1.5} className="shrink-0 text-[color:var(--accent-blue)] mt-0.5" aria-hidden="true" />
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
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-4 grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-4 border-l-[3px] border-l-[var(--risk-high)]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {copy.sections.riskLabels.high}
              </div>
              <div className="mt-1.5 text-2xl font-semibold leading-none">{riskCounts.high}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-tight">
                {copy.riskInterpretations.high}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 border-l-[3px] border-l-[var(--risk-medium)]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {copy.sections.riskLabels.medium}
              </div>
              <div className="mt-1.5 text-2xl font-semibold leading-none">{riskCounts.medium}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-tight">
                {copy.riskInterpretations.medium}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 border-l-[3px] border-l-[var(--risk-low)]">
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
          <WorkspaceSectionCard
            title={copy.sections.chartTitles.riskRadar}
            actions={<span className="text-xs text-muted-foreground">{radarData.length} {copy.sections.radarDimensionsLabel}</span>}
            className="chart-animate"
          >
            <div className="p-4">
              <ChartRiskRadar data={radarData} height={220} />
            </div>
          </WorkspaceSectionCard>
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

        <WorkspaceSectionCard title={`${copy.sections.chartTitles.rocCurve}${copy.sections.chartTitles.syntheticSuffix}`} className="chart-animate">
          <div className="p-4">
            <ChartRocCurve data={rocData} />
          </div>
        </WorkspaceSectionCard>

        {totalRisk > 0 && (
          <WorkspaceSectionCard title={copy.sections.chartTitles.riskDistribution} className="chart-animate">
            <div className="p-4">
              <InteractiveRiskDistribution data={riskDistData} />
            </div>
          </WorkspaceSectionCard>
        )}

        <WorkspaceSectionCard title={copy.sections.chartTitles.attackComparison} className="chart-animate">
          <div className="p-4">
            {attackComparisonData.length > 0 ? (
              <ChartAttackComparison data={attackComparisonData} />
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                {copy.sections.chartTitles.noDataAvailable}
              </div>
            )}
          </div>
        </WorkspaceSectionCard>
      </div>

      {/* Main content grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent results table */}
        <WorkspaceSectionCard title={copy.sections.recentResults} className="lg:col-span-2">
          <div className="overflow-auto max-h-[380px]">
            {recentRows.length > 0 ? (
              <table className="w-full border-collapse text-xs">
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
                    const rowBorder = !isNaN(auc)
                      ? auc > 0.85
                        ? "border-l-2 border-l-[var(--risk-high)]"
                        : auc >= 0.7
                          ? "border-l-2 border-l-[var(--warning)]"
                          : "border-l-2 border-l-[var(--success)]"
                      : "";
                    return (
                    <tr
                      key={`${row.track}-${row.attack}-${row.defense}-${row.model}-${row.aucLabel}-${index}`}
                      className={`table-row-hover border-b border-border transition-colors hover:bg-muted/20 ${rowBorder}`}
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

        {/* Tasks panel */}
        <WorkspaceSectionCard title={copy.sections.tasks}>
          <div className="p-4">
            {copy.todoItems.map((item, index) => (
              <div key={item} className="flex items-start gap-2 border-b border-border py-2 last:border-0">
                <span className="mono inline-flex h-4 w-4 shrink-0 items-center justify-center bg-accent text-[9px] font-semibold rounded-sm">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
              </div>
            ))}
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
