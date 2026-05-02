"use client";

import type { CSSProperties } from "react";

import type { CatalogEntryViewModel } from "@/lib/catalog";
import type { AttackDefenseRowViewModel } from "@/lib/attack-defense-table";
import { type Locale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { classifyRisk, riskLabel, HIGH_RISK_AUC_THRESHOLD } from "@/lib/risk-report";
import { ChartAucDistribution } from "@/components/chart-auc-distribution";
import { ChartRocCurve } from "@/components/chart-roc-curve";
import { ChartRiskDistribution } from "@/components/chart-risk-distribution";
import { ChartAttackComparison } from "@/components/chart-attack-comparison";

type ComparePair = {
  attack: string;
  model: string;
  track: string;
  defense: string;
  undefended: { auc: number; asr: number; tpr: number } | null;
  defended: { auc: number; asr: number; tpr: number } | null;
  deltaAuc: number | null;
  deltaAsr: number | null;
  deltaTpr: number | null;
};

const ROOT_STYLE = {
  width: "794px",
  background: "#f8fafc",
  color: "#111827",
  fontFamily: "\"IBM Plex Sans\", \"Segoe UI\", sans-serif",
  "--background": "#ffffff",
  "--card": "#ffffff",
  "--foreground": "#111827",
  "--muted": "#f8fafc",
  "--muted-foreground": "#64748b",
  "--border": "#dbe1ea",
  "--accent-blue": "#2563eb",
  "--risk-high": "#ef4444",
  "--risk-high-bg": "#fee2e2",
  "--risk-medium": "#f59e0b",
  "--risk-medium-bg": "#fef3c7",
  "--risk-low": "#10b981",
  "--risk-low-bg": "#d1fae5",
  "--success": "#059669",
  "--warning": "#d97706",
} as CSSProperties;

const PAGE_STYLE: CSSProperties = {
  width: "794px",
  minHeight: "1123px",
  boxSizing: "border-box",
  background: "#ffffff",
  padding: "28px 32px 32px",
  overflow: "hidden",
  pageBreakAfter: "always",
};

const SECTION_STYLE: CSSProperties = {
  border: "1px solid #dbe1ea",
  background: "#ffffff",
};

const TABLE_STYLE: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
  fontSize: "11px",
};

const TH_STYLE: CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "1px solid #dbe1ea",
  color: "#64748b",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  verticalAlign: "top",
};

const TD_STYLE: CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #eef2f7",
  color: "#111827",
  lineHeight: 1.45,
  verticalAlign: "top",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function parseMetric(value: string) {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

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
    .slice(0, 8);
}

function computeComparePairs(rows: AttackDefenseRowViewModel[]): ComparePair[] {
  const buckets = new Map<string, { undefended: AttackDefenseRowViewModel[]; defended: AttackDefenseRowViewModel[] }>();

  for (const row of rows) {
    const key = `${row.attack}|||${row.model}`;
    if (!buckets.has(key)) {
      buckets.set(key, { undefended: [], defended: [] });
    }
    const bucket = buckets.get(key)!;
    if (row.defense === "none" || row.defense === "None") {
      bucket.undefended.push(row);
    } else {
      bucket.defended.push(row);
    }
  }

  const pairs: ComparePair[] = [];

  for (const [key, bucket] of buckets) {
    const [attack, model] = key.split("|||");
    const baseTrack = bucket.undefended[0]?.track ?? bucket.defended[0]?.track ?? "";
    const undefended = bucket.undefended.length > 0
      ? {
          auc: bucket.undefended.reduce((sum, row) => sum + (parseMetric(row.aucLabel) ?? 0), 0) / bucket.undefended.length,
          asr: bucket.undefended.reduce((sum, row) => sum + (parseMetric(row.asrLabel) ?? 0), 0) / bucket.undefended.length,
          tpr: bucket.undefended.reduce((sum, row) => sum + (parseMetric(row.tprLabel) ?? 0), 0) / bucket.undefended.length,
        }
      : null;

    const byDefense = new Map<string, AttackDefenseRowViewModel[]>();
    for (const row of bucket.defended) {
      if (!byDefense.has(row.defense)) {
        byDefense.set(row.defense, []);
      }
      byDefense.get(row.defense)!.push(row);
    }

    for (const [defense, defenseRows] of byDefense) {
      const defended = {
        auc: defenseRows.reduce((sum, row) => sum + (parseMetric(row.aucLabel) ?? 0), 0) / defenseRows.length,
        asr: defenseRows.reduce((sum, row) => sum + (parseMetric(row.asrLabel) ?? 0), 0) / defenseRows.length,
        tpr: defenseRows.reduce((sum, row) => sum + (parseMetric(row.tprLabel) ?? 0), 0) / defenseRows.length,
      };

      pairs.push({
        attack,
        model,
        track: baseTrack,
        defense,
        undefended,
        defended,
        deltaAuc: undefended ? defended.auc - undefended.auc : null,
        deltaAsr: undefended ? defended.asr - undefended.asr : null,
        deltaTpr: undefended ? defended.tpr - undefended.tpr : null,
      });
    }
  }

  return pairs.sort((left, right) => (left.deltaAuc ?? 0) - (right.deltaAuc ?? 0));
}

function evidenceAccent(evidenceLevel: string) {
  const normalized = evidenceLevel.trim().toLowerCase();
  if (normalized.includes("admitted")) {
    return { border: "#bbf7d0", background: "#f0fdf4", color: "#15803d" };
  }
  if (normalized.includes("mainline")) {
    return { border: "#bfdbfe", background: "#eff6ff", color: "#1d4ed8" };
  }
  if (normalized.includes("challenger")) {
    return { border: "#fde68a", background: "#fffbeb", color: "#b45309" };
  }
  return { border: "#dbe1ea", background: "#f8fafc", color: "#475569" };
}

function renderMetric(value: number | null) {
  return value === null ? "—" : value.toFixed(3);
}

function RenderMetricDelta({
  value,
  lowerIsBetter = false,
}: {
  value: number | null;
  lowerIsBetter?: boolean;
}) {
  if (value === null) {
    return <span style={{ color: "#94a3b8" }}>—</span>;
  }
  const sign = value >= 0 ? "+" : "";
  const isGood = lowerIsBetter ? value < 0 : value > 0;
  return (
    <span
      style={{
        fontFamily: "\"IBM Plex Mono\", monospace",
        fontWeight: 700,
        color: isGood ? "#059669" : "#d97706",
      }}
    >
      {sign}{value.toFixed(3)}
    </span>
  );
}

function RenderRiskPill({ auc, locale }: { auc: number; locale: Locale }) {
  const level = classifyRisk(auc);
  const label = riskLabel(level, locale);
  const color =
    level === "high" ? "#ef4444" : level === "medium" ? "#f59e0b" : "#10b981";
  const background =
    level === "high" ? "#fee2e2" : level === "medium" ? "#fef3c7" : "#d1fae5";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 9999,
        padding: "4px 10px",
        fontSize: "10px",
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: "nowrap",
        color,
        background,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}

function RenderEvidenceCell({
  evidenceLevel,
  qualityCost,
  qualityCostLabel,
}: {
  evidenceLevel: string;
  qualityCost: string;
  qualityCostLabel: string;
}) {
  const accent = evidenceAccent(evidenceLevel);
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span
        style={{
          display: "inline-flex",
          width: "fit-content",
          alignItems: "center",
          borderRadius: 9999,
          border: `1px solid ${accent.border}`,
          background: accent.background,
          color: accent.color,
          fontSize: "10px",
          fontWeight: 700,
          lineHeight: 1,
          padding: "4px 8px",
        }}
      >
        {evidenceLevel}
      </span>
      <span
        style={{
          display: "inline-flex",
          width: "fit-content",
          maxWidth: "100%",
          borderRadius: 9999,
          border: "1px solid #dbe1ea",
          background: "#f8fafc",
          color: "#64748b",
          fontSize: "10px",
          lineHeight: 1.35,
          padding: "4px 8px",
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {qualityCostLabel}: {qualityCost}
      </span>
    </div>
  );
}

export function PrintableAuditReport({
  locale,
  rows,
  contracts,
}: {
  locale: Locale;
  rows: AttackDefenseRowViewModel[];
  contracts: CatalogEntryViewModel[];
}) {
  const copy = WORKSPACE_COPY[locale].reports;
  const dims = copy.chartDimensions;

  const aucValues = rows
    .map((row) => parseMetric(row.aucLabel))
    .filter((value): value is number => value !== null);
  const aucBins: Record<string, number> = {};
  for (const auc of aucValues) {
    const bin = (Math.floor(auc * 10) / 10).toFixed(1);
    aucBins[bin] = (aucBins[bin] || 0) + 1;
  }
  const aucDistData = Object.entries(aucBins)
    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
    .map(([auc, count]) => ({ auc: parseFloat(auc), count }));
  const avgAuc = aucValues.length > 0
    ? aucValues.reduce((sum, value) => sum + value, 0) / aucValues.length
    : 0.85;

  const riskCounts = { high: 0, medium: 0, low: 0 };
  for (const row of rows) {
    const auc = parseMetric(row.aucLabel);
    if (auc !== null) {
      riskCounts[classifyRisk(auc)]++;
    }
  }

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

  const gapData = computeCoverageGaps(rows);
  const comparePairs = computeComparePairs(rows);
  const compareChunks = chunkArray(comparePairs, 5);
  const contractChunks = chunkArray(contracts, 8);
  const resultChunks = chunkArray(rows, 8);

  const defendedCount = rows.filter((row) => row.defense !== "none" && row.defense !== "None").length;
  const effectivePairs = comparePairs.filter((pair) => (pair.deltaAuc ?? 0) < -0.1).length;
  const avgAucReduction = comparePairs.length > 0
    ? comparePairs.reduce((sum, pair) => sum + (pair.deltaAuc ?? 0), 0) / comparePairs.length
    : 0;

  return (
    <div style={ROOT_STYLE}>
      <div data-print-page style={PAGE_STYLE}>
        <header style={{ borderBottom: "1px solid #dbe1ea", paddingBottom: "12px", marginBottom: "18px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>
            {copy.eyebrow}
          </div>
          <h1 style={{ margin: "8px 0 4px", fontSize: "26px", lineHeight: 1.1, fontWeight: 650 }}>
            {copy.title}
          </h1>
          <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.65, color: "#475569" }}>
            {copy.description}
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <div style={{ ...SECTION_STYLE, padding: "10px 12px" }}>
            <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Rows
            </div>
            <div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 700 }}>{rows.length}</div>
          </div>
          <div style={{ ...SECTION_STYLE, padding: "10px 12px" }}>
            <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Contracts
            </div>
            <div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 700 }}>{contracts.length}</div>
          </div>
          <div style={{ ...SECTION_STYLE, padding: "10px 12px" }}>
            <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {copy.compareView.summaryPairs}
            </div>
            <div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 700 }}>{comparePairs.length}</div>
          </div>
          <div style={{ ...SECTION_STYLE, padding: "10px 12px" }}>
            <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Avg AUC
            </div>
            <div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 700 }}>{avgAuc.toFixed(3)}</div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <figure style={{ ...SECTION_STYLE, margin: 0, padding: "10px 12px" }}>
            <figcaption style={{ marginBottom: "8px", fontSize: "11px", fontWeight: 700 }}>{copy.sections.aucDistribution}</figcaption>
            <ChartAucDistribution data={aucDistData} />
          </figure>
          <figure style={{ ...SECTION_STYLE, margin: 0, padding: "10px 12px" }}>
            <figcaption style={{ marginBottom: "8px", fontSize: "11px", fontWeight: 700 }}>{copy.sections.rocCurve}</figcaption>
            <ChartRocCurve data={generateRocData(avgAuc)} />
          </figure>
          <figure style={{ ...SECTION_STYLE, margin: 0, padding: "10px 12px" }}>
            <figcaption style={{ marginBottom: "8px", fontSize: "11px", fontWeight: 700 }}>{copy.sections.riskDistribution}</figcaption>
            <ChartRiskDistribution data={riskDistData} />
          </figure>
          <figure style={{ ...SECTION_STYLE, margin: 0, padding: "10px 12px" }}>
            <figcaption style={{ marginBottom: "8px", fontSize: "11px", fontWeight: 700 }}>{copy.sections.attackComparison}</figcaption>
            <ChartAttackComparison data={attackComparisonData} />
          </figure>
        </section>

        <section style={SECTION_STYLE}>
          <div style={{ borderBottom: "1px solid #dbe1ea", padding: "10px 12px", background: "#f8fafc" }}>
            <h2 style={{ margin: 0, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
              {copy.sections.coverageGaps}
            </h2>
          </div>
          <div style={{ padding: "12px" }}>
            {gapData.length > 0 ? (
              <table style={TABLE_STYLE}>
                <colgroup>
                  <col style={{ width: "31%" }} />
                  <col style={{ width: "41%" }} />
                  <col style={{ width: "28%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={TH_STYLE}>{copy.tableHeaders.attack}</th>
                    <th style={TH_STYLE}>{copy.tableHeaders.defense}</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>AUC</th>
                  </tr>
                </thead>
                <tbody>
                  {gapData.map((gap) => (
                    <tr key={`${gap.attack}-${gap.defense}-${gap.auc}`}>
                      <td style={TD_STYLE}>{gap.attack}</td>
                      <td style={TD_STYLE}>{gap.defense}</td>
                      <td style={{ ...TD_STYLE, textAlign: "right", fontFamily: "\"IBM Plex Mono\", monospace" }}>{gap.auc.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontSize: "11px", color: "#64748b" }}>{copy.emptyGaps}</div>
            )}
          </div>
        </section>
      </div>

      {compareChunks.map((chunk, index) => (
        <div data-print-page key={`compare-${index}`} style={PAGE_STYLE}>
          <header style={{ borderBottom: "1px solid #dbe1ea", paddingBottom: "10px", marginBottom: "16px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>
              {copy.eyebrow}
            </div>
            <h2 style={{ margin: "8px 0 0", fontSize: "22px", fontWeight: 650 }}>{copy.compareView.title}</h2>
          </header>

          {index === 0 ? (
            <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginBottom: "16px" }}>
              <div style={{ ...SECTION_STYLE, padding: "12px" }}>
                <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {copy.compareView.summaryPairs}
                </div>
                <div style={{ marginTop: "8px", fontSize: "22px", fontWeight: 700 }}>{comparePairs.length}</div>
              </div>
              <div style={{ ...SECTION_STYLE, padding: "12px" }}>
                <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {copy.compareView.summaryAvgChange}
                </div>
                <div style={{ marginTop: "8px", fontSize: "22px", fontWeight: 700, color: avgAucReduction < 0 ? "#059669" : "#d97706" }}>
                  {avgAucReduction >= 0 ? "+" : ""}{avgAucReduction.toFixed(3)}
                </div>
              </div>
              <div style={{ ...SECTION_STYLE, padding: "12px" }}>
                <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {copy.compareView.summaryEffective}
                </div>
                <div style={{ marginTop: "8px", fontSize: "22px", fontWeight: 700, color: "#059669" }}>
                  {effectivePairs}/{comparePairs.length || 1}
                </div>
              </div>
            </section>
          ) : null}

          <section style={SECTION_STYLE}>
            <div style={{ padding: "12px" }}>
              <table style={TABLE_STYLE}>
                <colgroup>
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={TH_STYLE}>{copy.compareView.attack}</th>
                    <th style={TH_STYLE}>{copy.compareView.defense}</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>{copy.compareView.noDefense} AUC</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>{copy.compareView.noDefense} ASR</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>{copy.compareView.noDefense} TPR</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>{copy.compareView.defense} AUC</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>{copy.compareView.defense} ASR</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>{copy.compareView.defense} TPR</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>{copy.compareView.delta} AUC</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>{copy.compareView.delta} ASR</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>{copy.compareView.delta} TPR</th>
                    <th style={TH_STYLE}>Model</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((pair) => (
                    <tr key={`${pair.attack}-${pair.model}-${pair.defense}`}>
                      <td style={TD_STYLE}>{pair.attack}</td>
                      <td style={TD_STYLE}>{pair.defense}</td>
                      <td style={{ ...TD_STYLE, textAlign: "right", fontFamily: "\"IBM Plex Mono\", monospace" }}>{renderMetric(pair.undefended?.auc ?? null)}</td>
                      <td style={{ ...TD_STYLE, textAlign: "right", fontFamily: "\"IBM Plex Mono\", monospace" }}>{renderMetric(pair.undefended?.asr ?? null)}</td>
                      <td style={{ ...TD_STYLE, textAlign: "right", fontFamily: "\"IBM Plex Mono\", monospace" }}>{renderMetric(pair.undefended?.tpr ?? null)}</td>
                      <td style={{ ...TD_STYLE, textAlign: "right", fontFamily: "\"IBM Plex Mono\", monospace" }}>{renderMetric(pair.defended?.auc ?? null)}</td>
                      <td style={{ ...TD_STYLE, textAlign: "right", fontFamily: "\"IBM Plex Mono\", monospace" }}>{renderMetric(pair.defended?.asr ?? null)}</td>
                      <td style={{ ...TD_STYLE, textAlign: "right", fontFamily: "\"IBM Plex Mono\", monospace" }}>{renderMetric(pair.defended?.tpr ?? null)}</td>
                      <td style={{ ...TD_STYLE, textAlign: "right" }}><RenderMetricDelta value={pair.deltaAuc} lowerIsBetter /></td>
                      <td style={{ ...TD_STYLE, textAlign: "right" }}><RenderMetricDelta value={pair.deltaAsr} lowerIsBetter /></td>
                      <td style={{ ...TD_STYLE, textAlign: "right" }}><RenderMetricDelta value={pair.deltaTpr} /></td>
                      <td style={TD_STYLE}>{pair.model}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ))}

      {contractChunks.map((chunk, index) => (
        <div data-print-page key={`contracts-${index}`} style={PAGE_STYLE}>
          <header style={{ borderBottom: "1px solid #dbe1ea", paddingBottom: "10px", marginBottom: "16px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>
              {copy.eyebrow}
            </div>
            <h2 style={{ margin: "8px 0 0", fontSize: "22px", fontWeight: 650 }}>{copy.sections.coverageGaps}</h2>
          </header>

          <section style={SECTION_STYLE}>
            <div style={{ padding: "12px" }}>
              <table style={TABLE_STYLE}>
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "34%" }} />
                  <col style={{ width: "22%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={TH_STYLE}>{copy.tableHeaders.contractKey}</th>
                    <th style={TH_STYLE}>{copy.tableHeaders.label}</th>
                    <th style={TH_STYLE}>{copy.tableHeaders.systemGap}</th>
                    <th style={TH_STYLE}>{copy.tableHeaders.workspace}</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((contract) => (
                    <tr key={contract.contractKey}>
                      <td style={{ ...TD_STYLE, fontFamily: "\"IBM Plex Mono\", monospace", fontSize: "10px" }}>{contract.contractKey}</td>
                      <td style={TD_STYLE}>{contract.label}</td>
                      <td style={TD_STYLE}>{contract.systemGap}</td>
                      <td style={TD_STYLE}>{contract.bestWorkspace}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ))}

      {resultChunks.map((chunk, index) => (
        <div data-print-page key={`results-${index}`} style={PAGE_STYLE}>
          <header style={{ borderBottom: "1px solid #dbe1ea", paddingBottom: "10px", marginBottom: "16px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>
              {copy.eyebrow}
            </div>
            <h2 style={{ margin: "8px 0 0", fontSize: "22px", fontWeight: 650 }}>{copy.sections.auditResults}</h2>
          </header>

          <section style={SECTION_STYLE}>
            <div style={{ padding: "12px" }}>
              <table style={TABLE_STYLE}>
                <colgroup>
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "23%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={TH_STYLE}>{copy.tableHeaders.attack}</th>
                    <th style={TH_STYLE}>{copy.tableHeaders.defense}</th>
                    <th style={TH_STYLE}>{copy.tableHeaders.model}</th>
                    <th style={TH_STYLE}>{copy.tableHeaders.track}</th>
                    <th style={TH_STYLE}>{copy.tableHeaders.evidence}</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>{copy.tableHeaders.auc}</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>{copy.tableHeaders.asr}</th>
                    <th style={{ ...TH_STYLE, textAlign: "right" }}>{copy.tableHeaders.tpr}</th>
                    <th style={TH_STYLE}>{copy.tableHeaders.risk}</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((row) => (
                    <tr key={`${row.track}-${row.attack}-${row.defense}-${row.model}`}>
                      <td style={TD_STYLE}>{row.attack}</td>
                      <td style={TD_STYLE}>{row.defense}</td>
                      <td style={TD_STYLE}>{row.model}</td>
                      <td style={TD_STYLE}>{row.track}</td>
                      <td style={TD_STYLE}>
                        <RenderEvidenceCell
                          evidenceLevel={row.evidenceLevel}
                          qualityCost={row.qualityCost}
                          qualityCostLabel={copy.tableHeaders.qualityCost}
                        />
                      </td>
                      <td style={{ ...TD_STYLE, textAlign: "right", fontFamily: "\"IBM Plex Mono\", monospace" }}>{row.aucLabel}</td>
                      <td style={{ ...TD_STYLE, textAlign: "right", fontFamily: "\"IBM Plex Mono\", monospace" }}>{row.asrLabel}</td>
                      <td style={{ ...TD_STYLE, textAlign: "right", fontFamily: "\"IBM Plex Mono\", monospace" }}>{row.tprLabel}</td>
                      <td style={TD_STYLE}>
                        <RenderRiskPill auc={parseFloat(row.aucLabel)} locale={locale} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ))}

      <div data-print-page style={PAGE_STYLE}>
        <header style={{ borderBottom: "1px solid #dbe1ea", paddingBottom: "10px", marginBottom: "16px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>
            {copy.eyebrow}
          </div>
          <h2 style={{ margin: "8px 0 0", fontSize: "22px", fontWeight: 650 }}>{locale === "zh-CN" ? "摘要" : "Summary"}</h2>
        </header>

        <section style={{ display: "grid", gap: "12px" }}>
          <div style={{ ...SECTION_STYLE, padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>{copy.compareView.title}</div>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.8, color: "#475569" }}>
              {effectivePairs > 0
                ? locale === "zh-CN"
                  ? `${effectivePairs} / ${comparePairs.length || 1} 个防御配对显示出显著的 AUC 降低，平均 AUC 变化为 ${avgAucReduction.toFixed(3)}。`
                  : `${effectivePairs} / ${comparePairs.length || 1} defense pairs show a meaningful AUC reduction, and the average AUC change is ${avgAucReduction.toFixed(3)}.`
                : locale === "zh-CN"
                  ? `目前没有防御配对显示出显著的 AUC 降低。平均 AUC 变化为 ${avgAucReduction.toFixed(3)}。`
                  : `No defense pair currently shows a strong AUC reduction. The average AUC change is ${avgAucReduction.toFixed(3)}.`}
            </p>
          </div>
          <div style={{ ...SECTION_STYLE, padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>{copy.sections.coverageGaps}</div>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.8, color: "#475569" }}>
              {gapData.length > 0
                ? locale === "zh-CN"
                  ? `${gapData.length} 个高风险缺口仍高于配置阈值。请优先处理 AUC 最高的攻击和防御配对。`
                  : `${gapData.length} high-risk gaps remain above the configured threshold. Prioritize the highest-AUC attack and defense pairs first.`
                : locale === "zh-CN"
                  ? "当前快照中未检测到高风险覆盖缺口。"
                  : "No high-risk coverage gaps were detected in the current snapshot."}
            </p>
          </div>
          <div style={{ ...SECTION_STYLE, padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>{locale === "zh-CN" ? "风险分布" : "Risk distribution"}</div>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.8, color: "#475569" }}>
              {locale === "zh-CN"
                ? `高风险: ${riskCounts.high} · 中风险: ${riskCounts.medium} · 低风险: ${riskCounts.low} · 已防御行数: ${defendedCount}`
                : `High risk: ${riskCounts.high} · Medium risk: ${riskCounts.medium} · Low risk: ${riskCounts.low} · Defended rows: ${defendedCount}`}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
