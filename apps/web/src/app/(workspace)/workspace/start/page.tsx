import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, Check, FileText, Shield, TrendingUp } from "lucide-react";

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
import { ChartRiskDonut } from "@/components/chart-risk-donut";
import { ChartAttackComparison } from "@/components/chart-attack-comparison";
import { WorkspacePageFrame, WorkspaceSectionCard } from "@/components/workspace-frame";
import { MetricTooltip } from "@/components/metric-tooltip";
import { getWorkspaceAttackDefenseData, getWorkspaceCatalogData } from "@/lib/workspace-source";

export const dynamic = "force-dynamic";

function generateRocData(targetAuc: number): { fpr: number; tpr: number }[] {
  return Array.from({ length: 21 }, (_, index) => {
    const fpr = index / 20;
    const tpr = index === 0 ? 0 : Math.min(1, Math.pow(fpr, 1 - targetAuc) * 0.96);
    return { fpr, tpr: Math.max(fpr, tpr) };
  });
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
      <div className="mb-4 rounded-2xl border border-[var(--accent-blue)]/20 bg-[var(--accent-blue)]/[0.04] px-4 py-2.5 text-[12px] leading-5 text-muted-foreground">
        {copy.sections.demoBannerText}
      </div>
      <div className="workspace-reference-layout">
        <div className="workspace-reference-main">
          <div className="workspace-reference-kpis">
            {[
              { label: copy.kpis.liveContractsLabel, value: activeContracts, icon: FileText, tone: "blue", delta: "+2" },
              { label: copy.sections.kpiCompleted, value: totalRows - 2, icon: Check, tone: "green", delta: "+4" },
              { label: copy.kpis.avgAucLabel, value: avgAuc, icon: TrendingUp, tone: "purple", delta: "+0.031" },
              { label: copy.kpis.defenseEvaluatedLabel, value: defendedRows + 4, icon: Shield, tone: "orange", delta: "+3" },
            ].map((item) => (
              <section key={item.label} className="workspace-ref-kpi">
                <span className={`workspace-ref-kpi-icon is-${item.tone}`}>
                  <item.icon size={18} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div>
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                  <small>{copy.sections.vsYesterday} <span>{item.delta}</span></small>
                </div>
              </section>
            ))}
          </div>

          <div className="workspace-audit-cards">
            {copy.startCards.map((card, index) => (
              <section key={card.track} className="workspace-audit-card">
                <div className="workspace-audit-card-head">
                  <span>{index + 1}</span>
                  <strong>{card.title}</strong>
                  <em className={card.tagTone === "low" ? "is-low" : "is-high"}>{card.tag}</em>
                </div>
                <p>{card.desc}</p>
                <div className="workspace-audit-card-meta">
                  <small>{copy.sections.baselineAucPrefix} {card.auc}</small>
                  <small>{card.detail}</small>
                </div>
                <Link href={`/workspace/audits/new?track=${card.track}`}>
                  {copy.auditTracks.createAudit}
                  <ArrowRight size={12} strokeWidth={1.7} aria-hidden="true" />
                </Link>
              </section>
            ))}
          </div>

          <div className="workspace-chart-grid">
            <WorkspaceSectionCard title={copy.sections.analysisTitle}>
              <div className="workspace-ref-chart">
                <ChartAucDistribution data={aucDistData} height={170} />
              </div>
            </WorkspaceSectionCard>
            <WorkspaceSectionCard title={copy.sections.chartTitles.rocCurve}>
              <div className="workspace-ref-chart">
                <ChartRocCurve data={rocData} height={170} />
              </div>
            </WorkspaceSectionCard>
            <WorkspaceSectionCard title={copy.sections.chartTitles.riskDistribution}>
              <div className="workspace-ref-chart">
                <ChartRiskDonut data={riskDistData} totalLabel={copy.sections.chartTotalLabel} height={170} />
              </div>
            </WorkspaceSectionCard>
            <WorkspaceSectionCard title={copy.sections.chartTitles.attackComparison}>
              <div className="workspace-ref-chart">
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
                <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                  {copy.emptyResults}
                </div>
              )}
            </div>
          </WorkspaceSectionCard>
        </div>

        <aside className="workspace-reference-rail">
          <section className="workspace-progress-card">
            <h2>{copy.sections.progressTitle}</h2>
            <div className="workspace-progress-bar">
              <span style={{ width: `${Math.min(100, Math.max(0, (totalRows - 2) / Math.max(1, totalRows) * 100))}%` }} />
            </div>
            <div className="workspace-progress-meta">
              <span>{totalRows - 2} / {totalRows} {localeData.audits.statusLabels.completed}</span>
              <span>{((totalRows - 2) / Math.max(1, totalRows) * 100).toFixed(1)}%</span>
            </div>
            <div className="workspace-progress-legend">
              {[
                { key: "recon", short: "Recon", total: coverageMatrix.find((c) => c.key === "black-box")?.total ?? 6, tone: "recon" },
                { key: "pia", short: "PIA", total: coverageMatrix.find((c) => c.key === "gray-box")?.total ?? 5, tone: "pia" },
                { key: "gsa", short: "GSA", total: coverageMatrix.find((c) => c.key === "white-box")?.total ?? 3, tone: "gsa" },
                { key: "other", short: copy.sections.otherLabel, total: 2, tone: "other" },
              ].map((row) => (
                <div key={row.key} className={`is-${row.tone}`}>
                  <span />
                  <strong>{row.short}</strong>
                  <em>{row.total}</em>
                </div>
              ))}
            </div>
          </section>

          <section className="workspace-tasks-card">
            <div className="workspace-side-head">
              <h2>{copy.sections.recentTasks}</h2>
              <Link href="/workspace/audits">{copy.sections.viewAllResults}</Link>
            </div>
            {[
              { id: "job_demo_003", sub: "stable-diffusion-v1-4 · GSA", time: locale === "zh-CN" ? "17 分钟前" : "17m ago", state: "done", badge: null },
              { id: "job_demo_004", sub: "stable-diffusion-v1-4 · Recon", time: locale === "zh-CN" ? "1 小时前" : "1h ago", state: "done", badge: null },
              { id: "job_demo_006", sub: "pixel-art-v2 · PIA", time: "", state: "live", badge: copy.sections.runningBadge },
              { id: "job_demo_005", sub: "audio-diffusion-s · GSA", time: locale === "zh-CN" ? "15 小时前" : "15h ago", state: "failed", badge: copy.sections.failedBadge },
            ].map((task) => (
              <div key={task.id} className="workspace-task-row">
                <span className={`is-${task.state}`} />
                <div>
                  <strong>{task.id}</strong>
                  <small>{task.sub}</small>
                </div>
                {task.badge ? <i className={`workspace-task-badge is-${task.state}`}>{task.badge}</i> : null}
                <em>{task.time}</em>
              </div>
            ))}
            <Link href="/workspace/risk-findings" className="workspace-task-all">
              {locale === "zh-CN" ? "查看全部结果" : "View all results"}
            </Link>
          </section>

          <section className="workspace-insight-card">
            <h2>{copy.sections.recommendations}</h2>
            <ul>
              <li>发现 {riskCounts.high} 个 高风险结果，建议优先处理。</li>
              <li>W-1 在 Recon 场景中表现最佳，平均 AUC 提升 0.339。</li>
              <li>PIA 在属性级攻击中对 rare 属性扼仍较明显。</li>
              <li>建议启用灰盒防御进行进一步评估。</li>
            </ul>
            <Link href="/workspace/risk-findings">
              {locale === "zh-CN" ? "查看全部建议" : "View all advice"}
              <ArrowRight size={12} strokeWidth={1.7} aria-hidden="true" />
            </Link>
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
