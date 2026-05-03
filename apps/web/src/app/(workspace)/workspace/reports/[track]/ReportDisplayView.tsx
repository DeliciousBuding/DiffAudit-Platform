import { ChartAttackComparison } from "@/components/chart-attack-comparison";
import { ChartAucDistribution } from "@/components/chart-auc-distribution";
import { ChartRiskDistribution } from "@/components/chart-risk-distribution";
import { ChartRocCurve } from "@/components/chart-roc-curve";
import { RiskBadge } from "@/components/risk-badge";
import { ReportEvidenceStack } from "@/components/report-evidence-stack";
import { StatusBadge } from "@/components/status-badge";
import { MetricTooltip } from "@/components/metric-tooltip";
import { type Locale } from "@/components/language-picker";
import { type AttackDefenseRowViewModel } from "@/lib/workspace-source";
import { classifyRisk, riskLabel, HIGH_RISK_AUC_THRESHOLD } from "@/lib/risk-report";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

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

function computeCoverageGaps(rows: Array<{ attack: string; defense: string; aucLabel: string }>) {
  return rows
    .map((row) => ({ attack: row.attack, defense: row.defense, auc: parseFloat(row.aucLabel) }))
    .filter((row) => !Number.isNaN(row.auc) && row.auc > HIGH_RISK_AUC_THRESHOLD)
    .sort((left, right) => right.auc - left.auc)
    .slice(0, 10);
}

type ReportDisplayViewProps = {
  locale: Locale;
  rows: AttackDefenseRowViewModel[];
};

export function ReportDisplayView({ locale, rows }: ReportDisplayViewProps) {
  const copy = WORKSPACE_COPY[locale].reports;
  const aucValues = rows
    .map((row) => parseFloat(row.aucLabel))
    .filter((value): value is number => !Number.isNaN(value));

  const aucBins: Record<string, number> = {};
  for (const auc of aucValues) {
    const bin = (Math.floor(auc * 10) / 10).toFixed(1);
    aucBins[bin] = (aucBins[bin] || 0) + 1;
  }

  const aucDistData = Object.entries(aucBins)
    .sort((left, right) => parseFloat(left[0]) - parseFloat(right[0]))
    .map(([auc, count]) => ({ auc: parseFloat(auc), count }));

  const avgAuc = aucValues.length > 0
    ? aucValues.reduce((sum, value) => sum + value, 0) / aucValues.length
    : 0.85;

  const riskCounts = { high: 0, medium: 0, low: 0 };
  for (const row of rows) {
    const auc = parseFloat(row.aucLabel);
    if (!Number.isNaN(auc)) {
      riskCounts[classifyRisk(auc)]++;
    }
  }

  const riskDistData = [
    { key: "high", label: riskLabel("high", locale), count: riskCounts.high },
    { key: "medium", label: riskLabel("medium", locale), count: riskCounts.medium },
    { key: "low", label: riskLabel("low", locale), count: riskCounts.low },
  ];

  const dims = copy.chartDimensions;

  // Compute attack comparison from real data — group by attack family
  const attackFamilyMap: Record<string, { aucSum: number; count: number }> = {};
  for (const row of rows) {
    const auc = parseFloat(row.aucLabel);
    if (Number.isNaN(auc)) continue;
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

  const gapData = computeCoverageGaps(rows);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2" id="report-charts">
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="border-b border-border pb-3 mb-3">
            <h2 className="text-[13px] font-bold text-foreground">
              {copy.sections.aucDistribution}
            </h2>
          </div>
          <div>
            {aucDistData.length > 0 ? (
              <ChartAucDistribution data={aucDistData} />
            ) : (
              <div className="flex h-[220px] items-center justify-center text-[13px] text-muted-foreground">
                {copy.emptyResults}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="border-b border-border pb-3 mb-3">
            <h2 className="text-[13px] font-bold text-foreground">
              {copy.sections.rocCurve}
            </h2>
          </div>
          <div>
            <ChartRocCurve data={generateRocData(avgAuc)} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="border-b border-border pb-3 mb-3">
            <h2 className="text-[13px] font-bold text-foreground">
              {copy.sections.riskDistribution}
            </h2>
          </div>
          <div>
            <ChartRiskDistribution data={riskDistData} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="border-b border-border pb-3 mb-3">
            <h2 className="text-[13px] font-bold text-foreground">
              {copy.sections.attackComparison}
            </h2>
          </div>
          <div>
            <ChartAttackComparison data={attackComparisonData} />
          </div>
        </section>
      </div>

      {gapData.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4" id="coverage-gaps">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <h2 className="text-[13px] font-bold text-foreground">
              {copy.sections.coverageGaps}
            </h2>
            <span className="text-[13px] text-[var(--warning)]">
              {gapData.length} {copy.sections.highRiskGaps}
            </span>
          </div>
          <div className="space-y-2">
            {gapData.map((gap) => {
              const pct = Math.round(gap.auc * 100);
              const barColor = gap.auc >= 0.85
                ? "var(--risk-high)"
                : gap.auc >= 0.75
                  ? "var(--risk-medium)"
                  : "var(--risk-low)";

              return (
                <div key={`${gap.attack}-${gap.defense}-${gap.auc}`} className="flex items-center gap-3">
                  <div className="w-36 shrink-0 font-medium text-[13px]" title={`${gap.attack} -> ${gap.defense}`}>
                    <div className="truncate">{gap.attack}</div>
                    <div className="truncate text-[13px] text-muted-foreground">{gap.defense}</div>
                  </div>
                  <div className="h-5 flex-1 overflow-hidden rounded-sm bg-muted/20">
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <span className="mono w-14 text-right text-[13px]">{gap.auc.toFixed(3)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-4" id="report-table">
        <div className="border-b border-border pb-3 mb-3">
          <h2 className="text-[13px] font-bold text-foreground">
            {copy.sections.auditResults}
          </h2>
        </div>
        <div className="max-h-[440px] overflow-auto">
          {rows.length > 0 ? (
            <table className="min-w-[900px] w-full border-collapse text-[13px]">
              <thead className="sticky top-0 bg-muted/30">
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.attack}</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.defense}</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.model}</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.track}</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.evidence}</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"><MetricTooltip term="auc" locale={locale} mode="icon">{copy.tableHeaders.auc}</MetricTooltip></th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"><MetricTooltip term="asr" locale={locale} mode="icon">{copy.tableHeaders.asr}</MetricTooltip></th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"><MetricTooltip term="tpr" locale={locale} mode="icon">{copy.tableHeaders.tpr}</MetricTooltip></th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.tableHeaders.risk}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.track}-${row.attack}-${row.defense}-${row.model}-${row.aucLabel}-${index}`}
                    className={`table-row-hover border-b border-border transition-colors hover:bg-muted/20 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/10"
                    }`}
                  >
                    <td className="px-3 py-3 font-medium">{row.attack}</td>
                    <td className="px-3 py-3 text-muted-foreground">{row.defense}</td>
                    <td className="px-3 py-3 text-muted-foreground">{row.model}</td>
                    <td className="px-3 py-3">
                      <StatusBadge tone="info">{row.track}</StatusBadge>
                    </td>
                    <td className="px-3 py-3">
                      <ReportEvidenceStack locale={locale} row={row} />
                    </td>
                    <td className="mono px-3 py-3 text-right">{row.aucLabel}</td>
                    <td className="mono px-3 py-3 text-right">{row.asrLabel}</td>
                    <td className="mono px-3 py-3 text-right">{row.tprLabel}</td>
                    <td className="px-3 py-3">
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
            <div className="px-3 py-4 text-center text-[13px] text-muted-foreground">
              {copy.emptyResults}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
