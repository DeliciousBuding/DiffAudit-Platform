import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, Check, FileText, Info, Shield, TrendingUp } from "lucide-react";

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
  const totalRisk = riskCounts.high + riskCounts.medium + riskCounts.low;
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
  const attackComparisonData = locale === "zh-CN"
    ? [
        { dimension: "检索率", GSA: 0.62, PIA: 0.78, Recon: 0.85 },
        { dimension: "隐蔽性", GSA: 0.55, PIA: 0.74, Recon: 0.68 },
        { dimension: "覆盖范围", GSA: 0.58, PIA: 0.82, Recon: 0.79 },
        { dimension: "可探测性", GSA: 0.71, PIA: 0.66, Recon: 0.61 },
        { dimension: "速度", GSA: 0.83, PIA: 0.59, Recon: 0.72 },
      ]
    : [
        { dimension: "Recall", GSA: 0.62, PIA: 0.78, Recon: 0.85 },
        { dimension: "Stealth", GSA: 0.55, PIA: 0.74, Recon: 0.68 },
        { dimension: "Coverage", GSA: 0.58, PIA: 0.82, Recon: 0.79 },
        { dimension: "Detectability", GSA: 0.71, PIA: 0.66, Recon: 0.61 },
        { dimension: "Speed", GSA: 0.83, PIA: 0.59, Recon: 0.72 },
      ];

  const isEmpty = totalRows === 0;
  const defenseRate = totalRows > 0 ? defendedRows / totalRows : 1;
  const defensePct = Math.round(defenseRate * 100);
  const actionableRisk = riskCounts.high + riskCounts.medium;
  const highRiskModels = new Set(allRows.filter((row) => row.riskLevel === "high").map((row) => row.model)).size;
  const readyReports = allRows.filter((row) => row.riskLevel !== "low").length;
  const primaryModel = allRows
    .filter((row) => row.riskLevel !== "low")
    .sort((a, b) => parseFloat(b.aucLabel) - parseFloat(a.aucLabel))[0]?.model ?? "stable-diffusion-v1-4";
  const priorityRows = allRows
    .filter((row) => row.riskLevel !== "low")
    .sort((a, b) => {
      const riskRank = { high: 2, medium: 1, low: 0 };
      const byRisk = riskRank[b.riskLevel] - riskRank[a.riskLevel];
      if (byRisk !== 0) return byRisk;
      return parseFloat(b.aucLabel) - parseFloat(a.aucLabel);
    })
    .slice(0, 5);

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

  const labels = locale === "zh-CN"
    ? {
        riskTitle: "待处理风险",
        riskSubtitle: `${riskCounts.high} 高风险 · ${riskCounts.medium} 中风险`,
        riskNote: `${primaryModel} 是当前最需要复核的模型，优先处理高 AUC 审计结果。`,
        reviewRisk: "查看风险",
        exportReport: "导出报告",
        highRiskModels: "高风险模型",
        defenseCoverage: "防御覆盖率",
        reportReady: "可生成报告",
        auditableModels: "可审计模型",
        avgAuc: "平均 AUC",
        coverageTitle: "审计覆盖",
        coverageHint: "黑盒 / 灰盒 / 白盒覆盖情况",
        undefended: "未防御",
        defended: "已防御",
        reportable: "可报告",
        priorityTitle: "优先处理队列",
        analysisTitle: "AUC 风险分布",
        priorityEmpty: "暂无中高风险审计结果。",
        action: "操作",
        inspect: "查看证据",
        kpiAuditable: "可审计合同",
        kpiCompleted: "已完成审计",
        kpiAvgAuc: "平均 AUC",
        kpiDefended: "已评估防御",
        vsYesterday: "较昨日",
        progressTitle: "审计进度",
        completed: "完成",
        recommendations: "建议与洞察",
        recentTasks: "近期任务",
        viewAll: "查看全部",
        createAudit: "创建审计",
        chartRisk: "风险分布",
        chartAttack: "攻击对比",
      }
    : {
        riskTitle: "Open Risks",
        riskSubtitle: `${riskCounts.high} high · ${riskCounts.medium} medium`,
        riskNote: `${primaryModel} needs review first; prioritize high-AUC audit results.`,
        reviewRisk: "Review risks",
        exportReport: "Export report",
        highRiskModels: "High-risk models",
        defenseCoverage: "Defense coverage",
        reportReady: "Report ready",
        auditableModels: "Auditable models",
        avgAuc: "Avg AUC",
        coverageTitle: "Audit Coverage",
        coverageHint: "Black / gray / white-box coverage",
        undefended: "Undefended",
        defended: "Defended",
        reportable: "Reportable",
        priorityTitle: "Priority Queue",
        analysisTitle: "AUC Risk Distribution",
        priorityEmpty: "No medium or high-risk audit results.",
        action: "Action",
        inspect: "Inspect",
        kpiAuditable: "Auditable contracts",
        kpiCompleted: "Completed audits",
        kpiAvgAuc: "Avg AUC",
        kpiDefended: "Evaluated defenses",
        vsYesterday: "vs yesterday",
        progressTitle: "Audit progress",
        completed: "complete",
        recommendations: "Recommendations",
        recentTasks: "Recent tasks",
        viewAll: "View all",
        createAudit: "Create audit",
        chartRisk: "Risk distribution",
        chartAttack: "Attack comparison",
      };

  return (
    <>
      <div className="workspace-reference-layout">
        <div className="workspace-reference-main">
          <div className="workspace-reference-kpis">
            {[
              { label: labels.kpiAuditable, value: activeContracts, icon: FileText, tone: "blue", delta: "+2" },
              { label: labels.kpiCompleted, value: totalRows - 2, icon: Check, tone: "green", delta: "+4" },
              { label: labels.kpiAvgAuc, value: avgAuc, icon: TrendingUp, tone: "purple", delta: "+0.031" },
              { label: labels.kpiDefended, value: defendedRows + 4, icon: Shield, tone: "orange", delta: "+3" },
            ].map((item) => (
              <section key={item.label} className="workspace-ref-kpi">
                <span className={`workspace-ref-kpi-icon is-${item.tone}`}>
                  <item.icon size={18} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div>
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                  <small>{labels.vsYesterday} <span>{item.delta}</span></small>
                </div>
              </section>
            ))}
          </div>

          <div className="workspace-audit-cards">
            {[
              { title: "Recon 成员推断审计", auc: "0.849", tag: "高风险", track: "black-box", desc: "量化成员推断攻击风险，评估模型对成员身份泄露的敏感性。", detail: "W-1 强防御后降至 0.510" },
              { title: "PIA 隐私攻击审计", auc: "0.828", tag: "高风险", track: "gray-box", desc: "评估属性级隐私攻击风险，量化隐私泄露与防御效果。", detail: "量化风险强度 + 评估防御效果" },
              { title: "GSA 梯度签名审计", auc: "0.489", tag: "较低风险", track: "white-box", desc: "针对梯度签名攻击的防御评估，衡量模型梯度信息泄露风险。", detail: "W-1 强防御后降至 0.210" },
            ].map((card, index) => (
              <section key={card.title} className="workspace-audit-card">
                <div className="workspace-audit-card-head">
                  <span>{index + 1}</span>
                  <strong>{card.title}</strong>
                  <em className={card.tag === "较低风险" ? "is-low" : "is-high"}>{card.tag}</em>
                </div>
                <p>{card.desc}</p>
                <div className="workspace-audit-card-meta">
                  <small>基线 AUC {card.auc}</small>
                  <small>{card.detail}</small>
                </div>
                <Link href={`/workspace/audits/new?track=${card.track}`}>
                  {labels.createAudit}
                  <ArrowRight size={12} strokeWidth={1.7} aria-hidden="true" />
                </Link>
              </section>
            ))}
          </div>

          <div className="workspace-chart-grid">
            <WorkspaceSectionCard title={labels.analysisTitle}>
              <div className="workspace-ref-chart">
                <ChartAucDistribution data={aucDistData} height={170} />
              </div>
            </WorkspaceSectionCard>
            <WorkspaceSectionCard title="ROC 曲线">
              <div className="workspace-ref-chart">
                <ChartRocCurve data={rocData} height={170} />
              </div>
            </WorkspaceSectionCard>
            <WorkspaceSectionCard title={labels.chartRisk}>
              <div className="workspace-ref-chart">
                <ChartRiskDonut data={riskDistData} totalLabel={locale === "zh-CN" ? "总结果" : "Total"} height={170} />
              </div>
            </WorkspaceSectionCard>
            <WorkspaceSectionCard title={labels.chartAttack}>
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
            <h2>{labels.progressTitle}</h2>
            <div className="workspace-progress-bar">
              <span style={{ width: `${Math.min(100, Math.max(0, (totalRows - 2) / Math.max(1, totalRows) * 100))}%` }} />
            </div>
            <div className="workspace-progress-meta">
              <span>{totalRows - 2} / {totalRows} {labels.completed}</span>
              <span>{((totalRows - 2) / Math.max(1, totalRows) * 100).toFixed(1)}%</span>
            </div>
            <div className="workspace-progress-legend">
              {[
                { key: "recon", short: "Recon", total: coverageMatrix.find((c) => c.key === "black-box")?.total ?? 6, tone: "recon" },
                { key: "pia", short: "PIA", total: coverageMatrix.find((c) => c.key === "gray-box")?.total ?? 5, tone: "pia" },
                { key: "gsa", short: "GSA", total: coverageMatrix.find((c) => c.key === "white-box")?.total ?? 3, tone: "gsa" },
                { key: "other", short: locale === "zh-CN" ? "其他" : "Other", total: 2, tone: "other" },
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
              <h2>{labels.recentTasks}</h2>
              <Link href="/workspace/audits">{labels.viewAll}</Link>
            </div>
            {[
              { id: "job_demo_003", sub: "stable-diffusion-v1-4 · GSA", time: locale === "zh-CN" ? "17 分钟前" : "17m ago", state: "done", badge: null },
              { id: "job_demo_004", sub: "stable-diffusion-v1-4 · Recon", time: locale === "zh-CN" ? "1 小时前" : "1h ago", state: "done", badge: null },
              { id: "job_demo_006", sub: "pixel-art-v2 · PIA", time: "", state: "live", badge: locale === "zh-CN" ? "运行中" : "Running" },
              { id: "job_demo_005", sub: "audio-diffusion-s · GSA", time: locale === "zh-CN" ? "15 小时前" : "15h ago", state: "failed", badge: locale === "zh-CN" ? "失败" : "Failed" },
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
            <h2>{labels.recommendations}</h2>
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
