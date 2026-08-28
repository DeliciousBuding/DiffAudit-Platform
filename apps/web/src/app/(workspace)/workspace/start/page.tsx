import { Suspense, use } from "react";
import Link from "@/lib/router/link";
import { ArrowRight, Check, FileText, Shield, TrendingUp } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { ClickableRow } from "@/components/clickable-row";
import { clientLocale } from "@/lib/locale";
import { StatusBadge } from "@/components/status-badge";
import { RiskBadge } from "@/components/risk-badge";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { KpiRowSkeleton, TableSkeleton } from "@/components/skeleton";
import { classifyRisk } from "@/lib/risk-report";
import { ChartAucDistribution } from "@/components/chart-auc-distribution";
import { ChartRocCurve } from "@/components/chart-roc-curve";
import { ChartRiskDonut } from "@/components/chart-risk-donut";
import { ChartAttackComparison } from "@/components/chart-attack-comparison";
import { WorkspacePageFrame, WorkspaceSectionCard } from "@/components/workspace-frame";
import { MetricTooltip } from "@/components/metric-tooltip";
import { getWorkspaceAttackDefenseData, getWorkspaceCatalogData, isWorkspaceDemoModeEnabled } from "@/lib/workspace-source";
import { stableLoad } from "@/lib/stable-promise";

const loadStartDashboardData = () =>
  stableLoad(`workspace:start:${isWorkspaceDemoModeEnabled() ? "demo" : "live"}`, () =>
  Promise.all([
    getWorkspaceCatalogData(),
    getWorkspaceAttackDefenseData(),
  ]),
);

function generateRocData(targetAuc: number): { fpr: number; tpr: number }[] {
  return Array.from({ length: 21 }, (_, index) => {
    const fpr = index / 20;
    const tpr = index === 0 ? 0 : Math.min(1, Math.pow(fpr, 1 - targetAuc) * 0.96);
    return { fpr, tpr: Math.max(fpr, tpr) };
  });
}

/**
 * KPI icon tint classes — full literal strings so Tailwind's content scanner
 * generates each variant (a dynamic `is-${tone}` template can't be detected).
 */
const KPI_TONE_CLASSES: Record<string, string> = {
  blue: "bg-[var(--info-soft)] text-[var(--accent-blue)]",
  green: "bg-[var(--success-soft)] text-[var(--success)]",
  purple: "bg-[var(--accent-purple-soft)] text-[var(--accent-purple)]",
  orange: "bg-[var(--warning-soft)] text-[var(--warning)]",
};

const AUDIT_TAG_TONE_CLASSES: Record<string, string> = {
  high: "bg-[var(--risk-high-bg)] text-[var(--risk-high)]",
  low: "bg-[var(--risk-low-bg)] text-[var(--risk-low)]",
};

const LEGEND_TONE_CLASSES: Record<string, string> = {
  recon: "bg-[var(--accent-blue)]",
  pia: "bg-[var(--accent-purple)]",
  gsa: "bg-[var(--success)]",
  other: "bg-[var(--muted-foreground)]",
};

const TASK_DOT_STATE_CLASSES: Record<string, string> = {
  done: "bg-[var(--success-soft)]",
  live: "bg-[var(--info-soft)]",
  failed: "bg-[var(--error-soft)]",
};

const TASK_BADGE_STATE_CLASSES: Record<string, string> = {
  live: "bg-[var(--info-soft)] text-[var(--accent-blue)]",
  failed: "bg-[var(--risk-high-bg)] text-[var(--risk-high)]",
};

/** Fetches and renders the KPI + table data via Suspense + use */
function WorkspaceData({ locale }: { locale: Locale }) {
  const localeData = WORKSPACE_COPY[locale];
  const copy = localeData.workspace;
  const [catalog, table] = use(loadStartDashboardData());

  const activeContracts = catalog?.stats.total ?? 0;
  const defendedRows = table?.stats.defended ?? 0;
  const allRows = table?.rows ?? [];
  const recentRows = allRows.slice(0, 10);

  const aucValues = allRows
    .map((r) => parseFloat(r.aucLabel))
    .filter((v): v is number => !isNaN(v));
  const avgAuc = aucValues.length > 0
    ? (aucValues.reduce((a, b) => a + b, 0) / aucValues.length).toFixed(3)
    : "n/a";
  const totalRows = table?.stats.total ?? 0;

  const riskCounts = { high: 0, medium: 0, low: 0 };
  for (const row of allRows) {
    const auc = parseFloat(row.aucLabel);
    if (!isNaN(auc)) {
      riskCounts[classifyRisk(auc)]++;
    }
  }
  const aucBins: Record<string, number> = {};
  for (const auc of aucValues) {
    const bin = (Math.floor(auc * 10) / 10).toFixed(1);
    aucBins[bin] = (aucBins[bin] || 0) + 1;
  }
  const aucDistData = Object.entries(aucBins)
    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
    .map(([auc, count]) => ({ auc: parseFloat(auc), count }));
  const rocData = generateRocData(avgAuc !== "n/a" ? parseFloat(avgAuc) : 0.75);
  const riskDistData = [
    { key: "high", label: copy.sections.riskLabels.high, count: riskCounts.high },
    { key: "medium", label: copy.sections.riskLabels.medium, count: riskCounts.medium },
    { key: "low", label: copy.sections.riskLabels.low, count: riskCounts.low },
  ];
  const attackComparisonData = copy.sections.attackComparisonDimensions.map((dim, i) => ({
    dimension: dim,
    GSA: [0.62, 0.55, 0.58, 0.71, 0.83][i] ?? 0,
    PIA: [0.78, 0.74, 0.82, 0.66, 0.59][i] ?? 0,
    Recon: [0.85, 0.68, 0.79, 0.61, 0.72][i] ?? 0,
  }));

  const trackOrder = [
    { key: "black-box", short: "Recon" },
    { key: "gray-box", short: "PIA" },
    { key: "white-box", short: "GSA" },
  ];
  const coverageMatrix = trackOrder.map((track) => {
    const rows = allRows.filter((row) => row.track === track.key);
    const defended = rows.filter((row) => row.defense !== "none").length;
    const highOrMedium = rows.filter((row) => row.riskLevel !== "low").length;
    return {
      ...track,
      total: rows.length,
      undefended: rows.length - defended,
      defended,
      reportable: highOrMedium,
    };
  });

  return (
    <>
      <div className="mb-4 rounded-2xl border border-[var(--accent-blue)]/20 bg-[var(--accent-blue)]/[0.04] px-4 py-2.5 text-[11px] leading-5 text-muted-foreground">
        {copy.sections.demoBannerText}
      </div>
      <div className="grid items-start gap-4 [grid-template-columns:minmax(0,1fr)_280px]">
        <div className="grid min-w-0 gap-4">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: copy.kpis.liveContractsLabel, value: activeContracts, icon: FileText, tone: "blue", delta: "+2" },
              { label: copy.sections.kpiCompleted, value: totalRows - 2, icon: Check, tone: "green", delta: "+4" },
              { label: copy.kpis.avgAucLabel, value: avgAuc, icon: TrendingUp, tone: "purple", delta: "+0.031" },
              { label: copy.kpis.defenseEvaluatedLabel, value: defendedRows + 4, icon: Shield, tone: "orange", delta: "+3" },
            ].map((item) => (
              <section key={item.label} className="flex min-h-[92px] items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${KPI_TONE_CLASSES[item.tone]}`}>
                  <item.icon size={18} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">{item.label}</p>
                  <strong className="mt-1 block text-2xl leading-none">{item.value}</strong>
                  <small className="mt-2 block text-[11px] text-muted-foreground">{copy.sections.vsYesterday} <span className="font-semibold text-success">{item.delta}</span></small>
                </div>
              </section>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {copy.startCards.map((card, index) => (
              <section key={card.track} className="grid min-h-[142px] gap-2.5 rounded-2xl border border-border bg-card p-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-[var(--info-soft)] text-[11px] font-extrabold text-[var(--accent-blue)]">{index + 1}</span>
                  <strong className="min-w-0 flex-1 overflow-hidden text-[13px] leading-tight line-clamp-2 break-words">{card.title}</strong>
                  <em className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] not-italic font-bold ${AUDIT_TAG_TONE_CLASSES[card.tagTone === "low" ? "low" : "high"]}`}>{card.tag}</em>
                </div>
                <p className="text-[13px] leading-[1.55] text-muted-foreground">{card.desc}</p>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <small className="text-[11px] leading-[1.55] text-muted-foreground">{copy.sections.baselineAucPrefix} {card.auc}</small>
                  <small className="text-[11px] leading-[1.55] text-muted-foreground">{card.detail}</small>
                </div>
                <Link href={`/workspace/audits/new?track=${card.track}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--accent-blue)]">
                  {copy.auditTracks.createAudit}
                  <ArrowRight size={12} strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </section>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-3 max-[1380px]:grid-cols-2">
            <WorkspaceSectionCard title={copy.sections.analysisTitle}>
              <div className="h-[190px] px-2 pt-1 pb-[6px]">
                <ChartAucDistribution data={aucDistData} height={170} />
              </div>
            </WorkspaceSectionCard>
            <WorkspaceSectionCard title={copy.sections.chartTitles.rocCurve}>
              <div className="h-[190px] px-2 pt-1 pb-[6px]">
                <ChartRocCurve data={rocData} height={170} />
              </div>
            </WorkspaceSectionCard>
            <WorkspaceSectionCard title={copy.sections.chartTitles.riskDistribution}>
              <div className="h-[190px] px-2 pt-1 pb-[6px]">
                <ChartRiskDonut data={riskDistData} totalLabel={copy.sections.chartTotalLabel} height={170} />
              </div>
            </WorkspaceSectionCard>
            <WorkspaceSectionCard title={copy.sections.chartTitles.attackComparison}>
              <div className="h-[190px] px-2 pt-1 pb-[6px]">
                <ChartAttackComparison data={attackComparisonData} height={170} />
              </div>
            </WorkspaceSectionCard>
          </div>

          <WorkspaceSectionCard title={copy.sections.recentResults}>
            <div className="overflow-auto max-h-[330px]">
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
                    {recentRows.slice(0, 5).map((row, index) => {
                      const auc = parseFloat(row.aucLabel);
                      return (
                      <ClickableRow
                        key={`${row.track}-${row.attack}-${row.defense}-${row.model}-${row.aucLabel}-${index}`}
                        href={`/workspace/risk-findings?model=${encodeURIComponent(row.model)}`}
                        className="table-row-hover border-b border-border transition-colors hover:bg-muted/20"
                      >
                        <td className="px-4 py-3">
                          {!isNaN(auc) ? <RiskBadge auc={auc} compact /> : "-"}
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
                <div className="px-4 py-6 space-y-4">
                  <div className="text-center">
                    <p className="text-[13px] font-semibold">{localeData.emptyWorkspace.title}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{localeData.emptyWorkspace.description}</p>
                  </div>
                  <div className="grid gap-2">
                    {localeData.emptyWorkspace.steps.map((s) => (
                      <div key={s.step} className="flex items-center gap-3 rounded-xl border border-border bg-muted/10 px-3 py-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/10 text-[11px] font-bold text-[var(--accent-blue)]">{s.step}</span>
                        <div>
                          <p className="text-[11px] font-medium">{s.title}</p>
                          <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/workspace/audits/new" className="workspace-btn-primary w-full justify-center px-4 py-2.5 text-sm font-semibold">
                    {localeData.emptyWorkspace.cta}
                  </Link>
                </div>
              )}
            </div>
          </WorkspaceSectionCard>
        </div>

        <aside className="grid min-w-0 gap-4">
          <section className="rounded-2xl border border-border bg-card p-3">
            <h2 className="m-0 text-[13px] font-semibold">{copy.sections.progressTitle}</h2>
            <div className="mt-3 h-[7px] rounded-full bg-[var(--muted)]">
              <span className="block h-full rounded-full bg-[linear-gradient(90deg,var(--accent-blue),var(--accent-purple),var(--success))]" style={{ width: `${Math.min(100, Math.max(0, (totalRows - 2) / Math.max(1, totalRows) * 100))}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{totalRows - 2} / {totalRows} {localeData.audits.statusLabels.completed}</span>
              <span>{((totalRows - 2) / Math.max(1, totalRows) * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-3 grid gap-[7px]">
              {[
                { key: "recon", short: "Recon", total: coverageMatrix.find((c) => c.key === "black-box")?.total ?? 6, tone: "recon" },
                { key: "pia", short: "PIA", total: coverageMatrix.find((c) => c.key === "gray-box")?.total ?? 5, tone: "pia" },
                { key: "gsa", short: "GSA", total: coverageMatrix.find((c) => c.key === "white-box")?.total ?? 3, tone: "gsa" },
                { key: "other", short: copy.sections.otherLabel, total: 2, tone: "other" },
              ].map((row) => (
                <div key={row.key} className="flex items-center justify-between text-[11px]">
                  <span className={`h-2 w-2 rounded-[2px] ${LEGEND_TONE_CLASSES[row.tone]}`} />
                  <strong className="mr-auto ml-2 text-muted-foreground">{row.short}</strong>
                  <em className="not-italic font-semibold">{row.total}</em>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[13px] font-semibold">{copy.sections.recentTasks}</h2>
              <Link href="/workspace/audits" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--accent-blue)]">{copy.sections.viewAllResults}</Link>
            </div>
            {[
              { id: "job_demo_003", sub: "stable-diffusion-v1-4 · GSA", time: locale === "zh-CN" ? "17 分钟前" : "17m ago", state: "done", badge: null },
              { id: "job_demo_004", sub: "stable-diffusion-v1-4 · Recon", time: locale === "zh-CN" ? "1 小时前" : "1h ago", state: "done", badge: null },
              { id: "job_demo_006", sub: "pixel-art-v2 · PIA", time: "", state: "live", badge: copy.sections.runningBadge },
              { id: "job_demo_005", sub: "audio-diffusion-s · GSA", time: locale === "zh-CN" ? "15 小时前" : "15h ago", state: "failed", badge: copy.sections.failedBadge },
            ].map((task) => (
              <div key={task.id} className="mt-2.5 flex items-center justify-between gap-2.5">
                <span className={`h-5 w-5 shrink-0 rounded-full ${TASK_DOT_STATE_CLASSES[task.state]}`} />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-[11px]">{task.id}</strong>
                  <small className="block text-[11px] leading-tight line-clamp-2 break-words text-muted-foreground">{task.sub}</small>
                </div>
                {task.badge ? <i className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] not-italic font-bold ${TASK_BADGE_STATE_CLASSES[task.state]}`}>{task.badge}</i> : null}
                <em className="text-[11px] not-italic text-muted-foreground">{task.time}</em>
              </div>
            ))}
            <Link href="/workspace/risk-findings" className="mt-2.5 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-border p-2 text-[13px] font-semibold text-[var(--accent-blue)]">
              {copy.sections.viewAllResults}
            </Link>
          </section>

          <section className="rounded-2xl border border-border bg-card p-3">
            <h2 className="m-0 text-[13px] font-semibold">{copy.sections.recommendations}</h2>
            <ul className="mt-2.5 grid gap-2 pl-4 text-[13px] leading-[1.55] text-muted-foreground marker:text-[var(--accent-blue)]">
              {copy.suggestions.recommendationItems(riskCounts.high).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <Link href="/workspace/risk-findings" className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--accent-blue)]">
              {copy.sections.viewAllSuggestions}
              <ArrowRight size={12} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}

export default function WorkspaceHomePage() {
  const locale = clientLocale();
  const copy = WORKSPACE_COPY[locale].workspace;

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
        <WorkspaceData locale={locale} />
      </Suspense>
    </WorkspacePageFrame>
  );
}
