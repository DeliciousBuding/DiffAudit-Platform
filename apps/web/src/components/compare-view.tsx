"use client";

import { useMemo } from "react";

import { type Locale } from "@/components/language-picker";
import { MetricTooltip } from "@/components/metric-tooltip";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { type AttackDefenseRowViewModel } from "@/lib/attack-defense-table";

type CompareViewProps = {
  rows: AttackDefenseRowViewModel[];
  locale: Locale;
};

interface ComparePair {
  attack: string;
  model: string;
  track: string;
  undefended: { auc: number; asr: number; tpr: number } | null;
  defended: { auc: number; asr: number; tpr: number; defense: string } | null;
  deltaAuc: number | null;
  deltaAsr: number | null;
  deltaTpr: number | null;
}

function computeComparePairs(rows: AttackDefenseRowViewModel[]): ComparePair[] {
  // Group by attack + model
  const byAttackModel = new Map<string, { undefended: AttackDefenseRowViewModel[]; defended: AttackDefenseRowViewModel[] }>();
  for (const row of rows) {
    const key = `${row.attack}|||${row.model}`;
    if (!byAttackModel.has(key)) {
      byAttackModel.set(key, { undefended: [], defended: [] });
    }
    const bucket = byAttackModel.get(key)!;
    if (row.defense === "none" || row.defense === "None") {
      bucket.undefended.push(row);
    } else {
      bucket.defended.push(row);
    }
  }

  const pairs: ComparePair[] = [];
  for (const [key, bucket] of byAttackModel) {
    const [attack, model] = key.split("|||");
    // Average undefended metrics
    const undefended = bucket.undefended.length > 0
      ? {
          auc: bucket.undefended.reduce((s, r) => s + (parseFloat(r.aucLabel) || 0), 0) / bucket.undefended.length,
          asr: bucket.undefended.reduce((s, r) => s + (parseFloat(r.asrLabel) || 0), 0) / bucket.undefended.length,
          tpr: bucket.undefended.reduce((s, r) => s + (parseFloat(r.tprLabel) || 0), 0) / bucket.undefended.length,
        }
      : null;

    // For defended, group by defense strategy
    const byDefense = new Map<string, AttackDefenseRowViewModel[]>();
    for (const r of bucket.defended) {
      if (!byDefense.has(r.defense)) byDefense.set(r.defense, []);
      byDefense.get(r.defense)!.push(r);
    }

    for (const [defense, defenseRows] of byDefense) {
      const defended = {
        auc: defenseRows.reduce((s, r) => s + (parseFloat(r.aucLabel) || 0), 0) / defenseRows.length,
        asr: defenseRows.reduce((s, r) => s + (parseFloat(r.asrLabel) || 0), 0) / defenseRows.length,
        tpr: defenseRows.reduce((s, r) => s + (parseFloat(r.tprLabel) || 0), 0) / defenseRows.length,
        defense,
      };

      const deltaAuc = undefended ? defended.auc - undefended.auc : null;
      const deltaAsr = undefended ? defended.asr - undefended.asr : null;
      const deltaTpr = undefended ? defended.tpr - undefended.tpr : null;

      pairs.push({ attack, model, track: bucket.undefended[0]?.track ?? bucket.defended[0]?.track ?? "", undefended, defended, deltaAuc, deltaAsr, deltaTpr });
    }
  }

  return pairs.sort((a, b) => (b.deltaAuc ?? 0) - (a.deltaAuc ?? 0));
}

function DeltaCell({ value, labelLowerIsBetter }: { value: number | null; labelLowerIsBetter?: boolean }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const sign = value >= 0 ? "+" : "";
  const isGood = labelLowerIsBetter ? value < 0 : value > 0;
  const color = isGood ? "var(--success)" : "var(--warning)";
  return (
    <span style={{ color, fontWeight: 600 }} className="mono text-xs">
      {sign}{value.toFixed(3)}
    </span>
  );
}

function DefenseBar({ undefendedAuc, defendedAuc, copy }: { undefendedAuc: number; defendedAuc: number; copy: ReturnType<typeof useCompareCopy> }) {
  const before = Math.max(0, Math.min(1, undefendedAuc));
  const after = Math.max(0, Math.min(1, defendedAuc));
  const reduction = before - after;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground w-8">{copy.before}</span>
        <div className="flex-1 h-3 bg-muted/20 rounded-sm overflow-hidden">
          <div
            className="h-full rounded-sm transition-all"
            style={{ width: `${before * 100}%`, backgroundColor: "var(--risk-high)" }}
          />
        </div>
        <span className="mono text-[10px] w-10 text-right">{before.toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground w-8">{copy.after}</span>
        <div className="flex-1 h-3 bg-muted/20 rounded-sm overflow-hidden">
          <div
            className="h-full rounded-sm transition-all"
            style={{ width: `${after * 100}%`, backgroundColor: reduction > 0.15 ? "var(--success)" : reduction > 0 ? "var(--risk-medium)" : "var(--risk-high)" }}
          />
        </div>
        <span className="mono text-[10px] w-10 text-right">{after.toFixed(2)}</span>
      </div>
    </div>
  );
}

function useCompareCopy(locale: Locale) {
  return WORKSPACE_COPY[locale].reports.compareView;
}

export function CompareView({ rows, locale }: CompareViewProps) {
  const copy = useCompareCopy(locale);
  const pairs = useMemo(() => computeComparePairs(rows), [rows]);

  if (pairs.length === 0) {
    return (
      <div className="border border-border bg-card rounded-lg p-6 text-center">
        <div className="text-xs text-muted-foreground">{copy.noPairs}</div>
      </div>
    );
  }

  // Summary stats
  const pairsWithDelta = pairs.filter((p) => p.deltaAuc !== null);
  const avgAucReduction = pairsWithDelta.length > 0
    ? pairsWithDelta.reduce((s, p) => s + (p.deltaAuc ?? 0), 0) / pairsWithDelta.length
    : 0;
  const effectiveCount = pairsWithDelta.filter((p) => (p.deltaAuc ?? 0) < -0.1).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="text-[13px] font-bold text-muted-foreground">
            {copy.summaryPairs}
          </div>
          <div className="mt-1.5 text-2xl font-semibold">{pairs.length}</div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {copy.effectiveCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="text-[13px] font-bold text-muted-foreground">
            {copy.summaryAvgChange}
          </div>
          <div className="mt-1.5 text-2xl font-semibold" style={{ color: avgAucReduction < 0 ? "var(--success)" : "var(--warning)" }}>
            {avgAucReduction >= 0 ? "+" : ""}{avgAucReduction.toFixed(3)}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {avgAucReduction < 0 ? copy.effectiveYes : copy.effectiveNo}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="text-[13px] font-bold text-muted-foreground">
            {copy.summaryEffective}
          </div>
          <div className="mt-1.5 text-2xl font-semibold" style={{ color: "var(--success)" }}>
            {effectiveCount}/{pairs.length}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {copy.effectiveNote}
          </p>
        </div>
      </div>

      {/* Comparison table */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <h2 className="text-[13px] font-bold text-muted-foreground">
            {copy.title}
          </h2>
        </div>
        <div className="overflow-auto max-h-[480px]">
          <table className="min-w-[900px] w-full border-collapse text-[13px]">
            <thead className="sticky top-0 bg-muted/30">
              <tr className="border-b border-border">
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.attack}</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{copy.defense}</th>
                <th colSpan={3} className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-l border-border">
                  {copy.noDefense}
                </th>
                <th colSpan={3} className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-l border-border">
                  {copy.defense}
                </th>
                <th colSpan={3} className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-blue)] border-l border-border">
                  {copy.delta}
                </th>
                <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-l border-border">
                  {copy.visualization}
                </th>
              </tr>
              <tr className="border-b border-border text-[11px] text-muted-foreground">
                <th></th><th></th>
                <th className="px-2 py-1.5 text-right mono"><MetricTooltip term="auc" locale={locale} mode="icon">{copy.auc}</MetricTooltip></th>
                <th className="px-2 py-1.5 text-right mono"><MetricTooltip term="asr" locale={locale} mode="icon">{copy.asr}</MetricTooltip></th>
                <th className="px-2 py-1.5 text-right mono"><MetricTooltip term="tpr" locale={locale} mode="icon">{copy.tpr}</MetricTooltip></th>
                <th className="px-2 py-1.5 text-right mono border-l border-border"><MetricTooltip term="auc" locale={locale} mode="icon">{copy.auc}</MetricTooltip></th>
                <th className="px-2 py-1.5 text-right mono"><MetricTooltip term="asr" locale={locale} mode="icon">{copy.asr}</MetricTooltip></th>
                <th className="px-2 py-1.5 text-right mono"><MetricTooltip term="tpr" locale={locale} mode="icon">{copy.tpr}</MetricTooltip></th>
                <th className="px-2 py-1.5 text-right border-l border-border text-[var(--accent-blue)]"><MetricTooltip term="auc" locale={locale} mode="icon">{copy.auc}</MetricTooltip></th>
                <th className="px-2 py-1.5 text-right text-[var(--accent-blue)]"><MetricTooltip term="asr" locale={locale} mode="icon">{copy.asr}</MetricTooltip></th>
                <th className="px-2 py-1.5 text-right text-[var(--accent-blue)]"><MetricTooltip term="tpr" locale={locale} mode="icon">{copy.tpr}</MetricTooltip></th>
                <th className="px-2 py-1.5 border-l border-border"></th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((pair, i) => {
                const u = pair.undefended;
                const d = pair.defended;
                return (
                  <tr
                    key={`${pair.attack}-${pair.defended?.defense ?? i}`}
                    className={`border-b border-border ${i % 2 === 0 ? "bg-background" : "bg-muted/10"}`}
                  >
                    <td className="px-3 py-3 font-medium">{pair.attack}</td>
                    <td className="px-3 py-3 text-muted-foreground">{d?.defense ?? "—"}</td>
                    <td className="mono px-2 py-3 text-right">{u ? u.auc.toFixed(3) : "—"}</td>
                    <td className="mono px-2 py-3 text-right">{u ? u.asr.toFixed(3) : "—"}</td>
                    <td className="mono px-2 py-3 text-right">{u ? u.tpr.toFixed(3) : "—"}</td>
                    <td className="mono px-2 py-3 text-right border-l border-border">{d ? d.auc.toFixed(3) : "—"}</td>
                    <td className="mono px-2 py-3 text-right">{d ? d.asr.toFixed(3) : "—"}</td>
                    <td className="mono px-2 py-3 text-right">{d ? d.tpr.toFixed(3) : "—"}</td>
                    <td className="px-2 py-3 text-right border-l border-border">
                      <DeltaCell value={pair.deltaAuc} labelLowerIsBetter />
                    </td>
                    <td className="px-2 py-3 text-right">
                      <DeltaCell value={pair.deltaAsr} labelLowerIsBetter />
                    </td>
                    <td className="px-2 py-3 text-right">
                      <DeltaCell value={pair.deltaTpr} />
                    </td>
                    <td className="px-2 py-3 border-l border-border min-w-[180px]">
                      {u && d && <DefenseBar undefendedAuc={u.auc} defendedAuc={d.auc} copy={copy} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
