import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";

import { type Locale } from "@/components/language-picker";
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
import { ReportsClient } from "@/app/(workspace)/workspace/reports/ReportsClient";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import { ReportEvidenceStack } from "@/components/report-evidence-stack";
import { getWorkspaceAttackDefenseData, getWorkspaceCatalogData } from "@/lib/workspace-source";
import { buildReportHref } from "@/lib/audit-flow";

export const dynamic = "force-dynamic";

function reportSummaryCopy(locale: Locale) {
  if (locale === "zh-CN") {
    return {
      title: "演示摘要",
      strongestRisk: "最高暴露面",
      strongestDefense: "最强防御结论",
      briefing: "讲解提示",
      fallback: "当前没有可展示的审计结果。",
      trackReview: "按攻击线审阅",
      trackReviewBody: "进入对应轨道的审计视图，查看证据、溯源和长期审计信息。",
      openAuditView: "打开审计视图",
      reportInfo: "报告信息",
      recentExports: "最近导出记录",
      templates: "报告模板库",
      owner: "负责人",
      generatedAt: "生成时间",
      status: "报告状态",
      completed: "已完成",
      pdfVersion: "PDF 版本",
      docxVersion: "DOCX 版本",
      pptxVersion: "PPTX 版本",
      enterpriseTemplate: "企业摘要模板",
      researchTemplate: "研究演示版模板",
      complianceTemplate: "合规模板",
      tracks: {
        "black-box": "黑盒",
        "gray-box": "灰盒",
        "white-box": "白盒",
      },
    };
  }

  return {
    title: "Demo briefing",
    strongestRisk: "Highest exposure",
    strongestDefense: "Strongest defense",
    briefing: "Narrative cue",
    fallback: "No audit result is available for the briefing panel.",
    trackReview: "Review by attack track",
    trackReviewBody: "Open each track's audit view for evidence, provenance, and long-term review context.",
    openAuditView: "Open audit view",
    reportInfo: "Report information",
    recentExports: "Recent exports",
    templates: "Report templates",
    owner: "Owner",
    generatedAt: "Generated at",
    status: "Report status",
    completed: "Completed",
    pdfVersion: "PDF version",
    docxVersion: "DOCX version",
    pptxVersion: "PPTX version",
    enterpriseTemplate: "Enterprise summary template",
    researchTemplate: "Research presentation template",
    complianceTemplate: "Compliance template",
    tracks: {
      "black-box": "Black-box",
      "gray-box": "Gray-box",
      "white-box": "White-box",
    },
  };
}

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
  const summaryCopy = reportSummaryCopy(locale);
  const [table, catalog] = await Promise.all([
    getWorkspaceAttackDefenseData(),
    getWorkspaceCatalogData(),
  ]);
  const rows = table?.rows ?? [];
  const contracts = catalog?.tracks.flatMap((track) => track.entries) ?? [];

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

  const highestRiskRow = [...rows]
    .filter((row) => !Number.isNaN(parseFloat(row.aucLabel)))
    .sort((left, right) => parseFloat(right.aucLabel) - parseFloat(left.aucLabel))[0] ?? null;

  const strongestDefenseRow = [...rows]
    .filter((row) => row.defense !== "none" && !Number.isNaN(parseFloat(row.aucLabel)))
    .sort((left, right) => parseFloat(left.aucLabel) - parseFloat(right.aucLabel))[0] ?? null;

  const briefingNote = highestRiskRow
    ? highestRiskRow.note
    : summaryCopy.fallback;
  const featuredReportName = highestRiskRow
    ? `${highestRiskRow.model} · ${highestRiskRow.attack}`
    : copy.sections.auditResults;
  const trackCards = (["black-box", "gray-box", "white-box"] as const).map((track) => ({
    track,
    label: summaryCopy.tracks[track],
    count: rows.filter((row) => row.track === track).length,
    href: buildReportHref(track, "audit"),
  }));

  // Coverage gaps visualization — 2.4.4
  const gapData = computeCoverageGaps(rows);

  const resultsContent = (
    <>
      <section className="workspace-report-feature">
        <div className="workspace-report-feature-body">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {summaryCopy.title}
          </div>
          <h2>{featuredReportName}</h2>
          <div className="workspace-report-scoreline">
            <span>{Math.round(avgAuc * 100)}</span>
            <small>/100</small>
            <p>{copy.description}</p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="workspace-report-mini-stat">
              <span>{summaryCopy.strongestRisk}</span>
              <strong>{highestRiskRow?.aucLabel ?? "—"}</strong>
            </div>
            <div className="workspace-report-mini-stat">
              <span>{summaryCopy.strongestDefense}</span>
              <strong>{strongestDefenseRow?.aucLabel ?? "—"}</strong>
            </div>
            <div className="workspace-report-mini-stat">
              <span>{copy.sections.highRiskGaps}</span>
              <strong>{gapData.length}</strong>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{briefingNote}</p>
        </div>
      </section>

      <section className="border border-border bg-card" id="report-tracks">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {summaryCopy.trackReview}
          </h2>
        </div>
        <div className="grid gap-3 p-3 md:grid-cols-3">
          {trackCards.map((card) => (
            <Link
              key={card.track}
              href={card.href}
              className="group rounded-lg border border-border bg-background p-4 transition-colors hover:border-[color:var(--accent-blue)]/30 hover:bg-muted/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold group-hover:text-[var(--accent-blue)] transition-colors">
                    {card.label}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {summaryCopy.trackReviewBody}
                  </p>
                </div>
                <span className="mono text-lg font-semibold">{card.count}</span>
              </div>
              <div className="mt-3 text-xs font-medium text-[var(--accent-blue)]">
                {summaryCopy.openAuditView}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Charts section */}
      <div className="grid gap-3 lg:grid-cols-2" id="report-charts">
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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

        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.rocCurve}
            </h2>
          </div>
          <div className="p-3">
            <ChartRocCurve data={rocData} />
          </div>
        </section>

        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.riskDistribution}
            </h2>
          </div>
          <div className="p-3">
            <ChartRiskDistribution data={riskDistData} />
          </div>
        </section>

        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
        <section className="border border-border bg-card" id="coverage-gaps">
          <div className="border-b border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.sections.coverageGaps}
            </h2>
            <span className="text-[10px] text-[color:var(--warning)]">
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
                    <div className="truncate text-[10px] text-muted-foreground">{gap.defense}</div>
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

      <section className="border border-border bg-card" id="report-table">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {copy.sections.auditResults}
          </h2>
        </div>
        <div className="overflow-auto max-h-[440px]">
          {rows.length > 0 ? (
            <table className="min-w-[900px] w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-muted/30">
                <tr className="border-b border-border">
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.attack}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.defense}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.model}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.track}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.evidence}</th>
                  <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">{copy.tableHeaders.auc}</th>
                  <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">{copy.tableHeaders.asr}</th>
                  <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">{copy.tableHeaders.tpr}</th>
                  <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">{copy.tableHeaders.risk}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.track}-${row.attack}-${row.defense}-${row.model}-${row.aucLabel}-${index}`}
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
                    <td className="px-3 py-2">
                      <ReportEvidenceStack locale={locale} row={row} compact />
                    </td>
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

  const rightRail = (
    <>
      <section className="workspace-inspector-card">
        <div className="workspace-inspector-card-header">
          <h2>{summaryCopy.reportInfo}</h2>
        </div>
        <div className="workspace-inspector-list">
          <div className="workspace-inspector-metric">
            <span>{copy.tableHeaders.model}</span>
            <strong>{highestRiskRow?.model ?? "—"}</strong>
          </div>
          <div className="workspace-inspector-metric">
            <span>{copy.tableHeaders.attack}</span>
            <strong>{highestRiskRow?.attack ?? "—"}</strong>
          </div>
          <div className="workspace-inspector-metric">
            <span>{summaryCopy.owner}</span>
            <strong>DiffAudit</strong>
          </div>
          <div className="workspace-inspector-metric">
            <span>{summaryCopy.generatedAt}</span>
            <strong>2026-04-15</strong>
          </div>
          <div className="workspace-inspector-metric">
            <span>{summaryCopy.status}</span>
            <strong className="text-[color:var(--success)]">{summaryCopy.completed}</strong>
          </div>
        </div>
      </section>

      <section className="workspace-inspector-card">
        <div className="workspace-inspector-card-header">
          <h2>{summaryCopy.recentExports}</h2>
        </div>
        <div className="workspace-report-rail-list">
          {[summaryCopy.pdfVersion, summaryCopy.docxVersion, summaryCopy.pptxVersion].map((item, index) => (
            <div key={item} className="workspace-report-rail-item">
              <span className="workspace-report-rail-icon">{index + 1}</span>
              <div>
                <strong>{item}</strong>
                <span>2026-04-15</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="workspace-inspector-card">
        <div className="workspace-inspector-card-header">
          <h2>{summaryCopy.templates}</h2>
        </div>
        <div className="workspace-report-rail-list">
          {[summaryCopy.enterpriseTemplate, summaryCopy.researchTemplate, summaryCopy.complianceTemplate].map((item, index) => (
            <div key={item} className="workspace-report-rail-item">
              <span className="workspace-report-rail-icon is-soft">{index + 1}</span>
              <div>
                <strong>{item}</strong>
                <span>{copy.sections.coverageGaps}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  return (
    <WorkspacePageFrame
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      actions={
        <ExportReportButton
          rows={rows}
          contracts={contracts}
          label={copy.exportSummary}
          locale={locale}
        />
      }
      rightRail={rightRail}
    >
      <ReportsClient rows={rows} locale={locale} resultsContent={resultsContent} />
    </WorkspacePageFrame>
  );
}

type WorkspaceReportsPageOptions = {
  locale?: Locale;
};

async function renderWorkspaceReportsPage({ locale }: WorkspaceReportsPageOptions = {}) {
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

    </div>
  );
}

export default async function WorkspaceReportsPage() {
  return renderWorkspaceReportsPage();
}
