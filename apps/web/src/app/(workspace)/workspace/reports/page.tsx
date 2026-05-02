import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Box, Crosshair, FileBarChart, FileText, ShieldCheck, Target } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { RiskBadge } from "@/components/risk-badge";
import { classifyRisk, riskLabel, HIGH_RISK_AUC_THRESHOLD, MAX_COVERAGE_GAPS } from "@/lib/risk-report";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import { getWorkspaceAttackDefenseData, getWorkspaceCatalogData } from "@/lib/workspace-source";
import { buildReportHref } from "@/lib/audit-flow";
import { ReportExportButtons } from "@/app/(workspace)/workspace/reports/ReportExportButtons";
import { InfoTooltip } from "@/components/info-tooltip";

/** Track icons for report generation cards */
function TrackIcon({ track }: { track: TrackKey }) {
  if (track === "black-box") {
    return <AlertTriangle size={18} strokeWidth={1.5} />;
  }
  if (track === "gray-box") {
    return <Crosshair size={18} strokeWidth={1.5} />;
  }
  return <Box size={18} strokeWidth={1.5} />;
}

export const dynamic = "force-dynamic";

type TrackKey = "black-box" | "gray-box" | "white-box";

/** Compute coverage gaps: attack/defense pairs with AUC above high-risk threshold -- 2.4.4 */
function computeCoverageGaps(rows: Array<{ attack: string; defense: string; aucLabel: string }>) {
  return rows
    .map((r) => ({
      attack: r.attack,
      defense: r.defense,
      auc: parseFloat(r.aucLabel),
    }))
    .filter((g) => !isNaN(g.auc) && g.auc > HIGH_RISK_AUC_THRESHOLD)
    .sort((a, b) => b.auc - a.auc)
    .slice(0, MAX_COVERAGE_GAPS);
}

/** Async server component that fetches and renders the report center */
async function ReportCenterSection({ locale }: { locale: Locale }) {
  const copy = WORKSPACE_COPY[locale].reports;
  const currentDate = new Date().toLocaleDateString(locale === "zh-CN" ? "zh-CN" : "en-US");
  const [table, catalog] = await Promise.all([
    getWorkspaceAttackDefenseData(),
    getWorkspaceCatalogData(),
  ]);
  const rows = table?.rows ?? [];
  const contracts = catalog?.tracks.flatMap((track) => track.entries) ?? [];

  // Build per-track summary data
  const tracks: TrackKey[] = ["black-box", "gray-box", "white-box"];
  const trackSummaryMap: Record<TrackKey, {
    count: number;
    highestAuc: number;
    model: string;
    attack: string;
  }> = {} as Record<TrackKey, { count: number; highestAuc: number; model: string; attack: string }>;

  for (const track of tracks) {
    const trackRows = rows.filter((r) => r.track === track);
    const sorted = [...trackRows]
      .filter((r) => !Number.isNaN(parseFloat(r.aucLabel)))
      .sort((a, b) => parseFloat(b.aucLabel) - parseFloat(a.aucLabel));
    const top = sorted[0];
    trackSummaryMap[track] = {
      count: trackRows.length,
      highestAuc: top ? parseFloat(top.aucLabel) : 0,
      model: top?.model ?? "--",
      attack: top?.attack ?? "--",
    };
  }

  // Comprehensive analysis data
  const gapData = computeCoverageGaps(rows);
  const highestRiskRow = [...rows]
    .filter((row) => !Number.isNaN(parseFloat(row.aucLabel)))
    .sort((left, right) => parseFloat(right.aucLabel) - parseFloat(left.aucLabel))[0] ?? null;

  const highestAuc = highestRiskRow ? parseFloat(highestRiskRow.aucLabel) : 0;

  // Top 3 defense strategies
  const defenseStrategies = copy.defenseStrategies;

  const pageContent = rows.length > 0 ? (
    <>
      {/* ---- Report Generation: 2-column layout ---- */}
      <section className="workspace-section-card">
        <div className="workspace-section-card-header">
          <h2 className="text-[13px] font-bold text-foreground">
            {copy.reportGeneration}
          </h2>
        </div>
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Left: Available Reports */}
          <div className="border-b border-border p-4 lg:border-b-0 lg:border-r lg:pr-6">
            <h3 className="text-[13px] font-bold text-foreground mb-3">
              {copy.generateByTrack}
            </h3>
            <div className="space-y-2.5">
              {tracks.map((track) => (
                <div
                  key={track}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-background p-3.5 transition-colors hover:border-[color:var(--accent-blue)]/30 hover:bg-muted/20"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
                      <TrackIcon track={track} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-blue)]">
                          {copy.trackLabels[track]}
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          / {copy.trackMethods[track]}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground line-clamp-2">
                        {copy.trackDescs[track]}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={buildReportHref(track, "audit")}
                    className="ml-3 shrink-0 rounded-xl border border-[var(--accent-blue)]/20 bg-[var(--accent-blue)]/10 px-3 py-1.5 text-[11px] font-semibold text-[var(--accent-blue)] transition-colors hover:bg-[var(--accent-blue)]/20"
                  >
                    {copy.generateReport}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Generated Reports */}
          <div className="p-4">
            <h3 className="text-[13px] font-bold text-foreground mb-3">
              {copy.generatedReports}
            </h3>
            <div className="space-y-2.5">
              {tracks.filter((track) => trackSummaryMap[track].count > 0).map((track) => {
                const summary = trackSummaryMap[track];
                const auc = summary.highestAuc;
                const riskLevel = classifyRisk(auc);
                const riskLbl = riskLabel(riskLevel, locale);
                const reportTitle = copy.trackReportTitles[track];
                return (
                  <div
                    key={track}
                    className="flex items-center justify-between rounded-2xl border border-border bg-background px-3.5 py-3 transition-colors hover:bg-muted/20"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{reportTitle}</span>
                        <StatusBadge tone={riskLevel === "high" ? "warning" : riskLevel === "medium" ? "info" : "success"}>
                          {riskLbl}
                        </StatusBadge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>{copy.date}: {currentDate}</span>
                        <span>{copy.tableHeaders.model}: {summary.model}</span>
                        <span className="mono">{copy.tableHeaders.auc}: {auc > 0 ? auc.toFixed(3) : "--"}</span>
                      </div>
                    </div>
                    <div className="ml-3 flex items-center gap-1.5 shrink-0">
                      <RiskBadge auc={auc} locale={locale} compact />
                      <Link
                        href={buildReportHref(track, "audit")}
                        className="rounded-xl border border-border px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-muted/30"
                      >
                        {copy.view}
                      </Link>
                      <button
                        type="button"
                        disabled
                        title={copy.downloadComingSoon}
                        className="rounded-xl border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground/60 cursor-not-allowed"
                      >
                        {copy.download}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Comprehensive Analysis ---- */}
      <section className="workspace-section-card bg-[color:var(--accent-blue)]/[0.02]">
        <div className="workspace-section-card-header">
          <h2 className="text-[13px] font-bold text-foreground">
            {copy.comprehensiveAnalysis}
          </h2>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-3">
          {/* Key Findings */}
          <div className="rounded-2xl border border-border bg-card p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
                <Target size={14} strokeWidth={1.5} />
              </span>
              <h4 className="text-[13px] font-bold text-foreground">
                {copy.keyFindings}
              </h4>
            </div>
            <p className="text-xs leading-5 text-foreground">
              {highestRiskRow
                ? copy.keyFindingsDetail(highestRiskRow.attack, highestRiskRow.aucLabel)
                : copy.noFinding}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <RiskBadge auc={highestAuc} locale={locale} />
              <span className="mono text-xs text-muted-foreground">
                <InfoTooltip content={WORKSPACE_COPY[locale].tooltips.auc}>AUC</InfoTooltip> {highestAuc > 0 ? highestAuc.toFixed(3) : "--"}
              </span>
            </div>
          </div>

          {/* Defense Gap */}
          <div className="rounded-2xl border border-border bg-card p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[color:var(--warning-soft)] text-[color:var(--warning)]">
                <AlertTriangle size={14} strokeWidth={1.5} />
              </span>
              <h4 className="text-[13px] font-bold text-foreground">
                {copy.defenseGap}
              </h4>
            </div>
            {gapData.length > 0 ? (
              <>
                <p className="text-xs leading-5 text-foreground">
                  {copy.defenseGapDetail(gapData.length, HIGH_RISK_AUC_THRESHOLD, gapData[0].attack, gapData[0].defense)}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full border border-[color:var(--warning-soft)] bg-[color:var(--warning-soft)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--warning)]">
                    {gapData.length} {copy.sections.highRiskGaps}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs leading-5 text-muted-foreground">
                {copy.noHighRiskGaps}
              </p>
            )}
          </div>

          {/* Recommended Defenses */}
          <div className="rounded-2xl border border-border bg-card p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[color:var(--success-soft)] text-[color:var(--success)]">
                <ShieldCheck size={14} strokeWidth={1.5} />
              </span>
              <h4 className="text-[13px] font-bold text-foreground">
                {copy.recommendedDefenses}
              </h4>
              <span className="text-[9px] text-muted-foreground/60 ml-auto">
                {copy.exampleDataLabel}
              </span>
            </div>
            <div className="space-y-2">
              {defenseStrategies.map((strategy) => (
                <div key={strategy.name} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full border border-[color:var(--accent-blue)]/20 bg-[color:var(--accent-blue)]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[var(--accent-blue)]">
                    {strategy.tag}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-foreground">{strategy.name}</div>
                    <div className="text-[10px] leading-4 text-muted-foreground">{strategy.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Export Options ---- */}
      <section className="workspace-section-card">
        <div className="workspace-section-card-header">
          <h2 className="text-[13px] font-bold text-foreground">
            {copy.exportOptions}
          </h2>
        </div>
        <div className="p-4">
          <ReportExportButtons rows={rows} locale={locale} contracts={contracts} />
        </div>
      </section>
    </>
  ) : (
    <EmptyState
      icon={FileBarChart}
      title={copy.emptyResults}
      description={locale === "zh-CN" ? "完成审计任务后，报告将在此处生成。" : "Reports will be generated here after completing audit tasks."}
      action={{ label: copy.createAuditTask, href: "/workspace/audits/new" }}
    />
  );

  return (
    <WorkspacePageFrame
      title={copy.title}
      titleClassName="text-xl"
    >
      {pageContent}
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
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-lg border border-border bg-muted/10" />
            <div className="h-64 animate-pulse rounded-lg border border-border bg-muted/10" />
          </div>
        </>
      }>
        <ReportCenterSection locale={resolvedLocale} />
      </Suspense>
    </div>
  );
}

export default async function WorkspaceReportsPage() {
  return renderWorkspaceReportsPage();
}
