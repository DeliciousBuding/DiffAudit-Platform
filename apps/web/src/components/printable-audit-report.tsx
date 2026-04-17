"use client";

import type { CatalogEntryViewModel } from "@/lib/catalog";
import type { AttackDefenseRowViewModel } from "@/lib/attack-defense-table";
import { type Locale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { classifyRisk, riskLabel } from "@/lib/risk-report";
import { ChartAucDistribution } from "@/components/chart-auc-distribution";
import { ChartRocCurve } from "@/components/chart-roc-curve";
import { ChartRiskDistribution } from "@/components/chart-risk-distribution";
import { ChartAttackComparison } from "@/components/chart-attack-comparison";
import { MetricLabel } from "@/components/metric-label";
import { StatusBadge } from "@/components/status-badge";
import { RiskBadge } from "@/components/risk-badge";
import { CompareView } from "@/components/compare-view";

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
    .filter((row) => !Number.isNaN(row.auc) && row.auc >= 0.7)
    .sort((left, right) => right.auc - left.auc)
    .slice(0, 10);
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

export function PrintableAuditReport({
  locale,
  rows,
  contracts,
  variant = "report",
}: {
  locale: Locale;
  rows: AttackDefenseRowViewModel[];
  contracts: CatalogEntryViewModel[];
  variant?: "report" | "competition";
}) {
  const copy = WORKSPACE_COPY[locale].reports;
  const dims = copy.chartDimensions;

  const aucValues = rows
    .map((row) => parseFloat(row.aucLabel))
    .filter((value): value is number => !Number.isNaN(value));
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
  const attackComparisonData = [
    { dimension: dims[0], Recon: 0.78, PIA: 0.65, GSA: 0.82 },
    { dimension: dims[1], Recon: 0.92, PIA: 0.71, GSA: 0.45 },
    { dimension: dims[2], Recon: 0.60, PIA: 0.85, GSA: 0.73 },
    { dimension: dims[3], Recon: 0.88, PIA: 0.79, GSA: 0.91 },
    { dimension: dims[4], Recon: 0.95, PIA: 0.68, GSA: 0.55 },
  ];
  const gapData = computeCoverageGaps(rows);

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        background: "#ffffff",
        color: "#111827",
        padding: "28px 32px 32px",
        boxSizing: "border-box",
        fontFamily: "\"IBM Plex Sans\", \"Segoe UI\", sans-serif",
      }}
    >
      <header style={{ borderBottom: "1px solid #dbe1ea", paddingBottom: "12px", marginBottom: "18px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>
          {copy.eyebrow}
        </div>
        {variant === "competition" ? (
          <div
            style={{
              display: "inline-flex",
              marginTop: "8px",
              padding: "4px 8px",
              border: "1px solid #c7d2fe",
              color: "#4338ca",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Competition
          </div>
        ) : null}
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
          fontSize: "11px",
        }}
      >
        <div style={{ border: "1px solid #dbe1ea", padding: "10px 12px" }}>
          <div style={{ color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Rows</div>
          <div style={{ marginTop: "6px", fontSize: "22px", fontWeight: 650 }}>{rows.length}</div>
        </div>
        <div style={{ border: "1px solid #dbe1ea", padding: "10px 12px" }}>
          <div style={{ color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Contracts</div>
          <div style={{ marginTop: "6px", fontSize: "22px", fontWeight: 650 }}>{contracts.length}</div>
        </div>
        <div style={{ border: "1px solid #dbe1ea", padding: "10px 12px" }}>
          <div style={{ color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{copy.compareView.summaryPairs}</div>
          <div style={{ marginTop: "6px", fontSize: "22px", fontWeight: 650 }}>
            {rows.filter((row) => row.defense !== "none" && row.defense !== "None").length}
          </div>
        </div>
        <div style={{ border: "1px solid #dbe1ea", padding: "10px 12px" }}>
          <div style={{ color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Avg AUC</div>
          <div style={{ marginTop: "6px", fontSize: "22px", fontWeight: 650 }}>{avgAuc.toFixed(3)}</div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <figure style={{ margin: 0, border: "1px solid #dbe1ea", padding: "10px 12px" }}>
          <figcaption style={{ marginBottom: "8px", fontSize: "11px", fontWeight: 600 }}>{copy.sections.aucDistribution}</figcaption>
          <ChartAucDistribution data={aucDistData} />
        </figure>
        <figure style={{ margin: 0, border: "1px solid #dbe1ea", padding: "10px 12px" }}>
          <figcaption style={{ marginBottom: "8px", fontSize: "11px", fontWeight: 600 }}>{copy.sections.rocCurve}</figcaption>
          <ChartRocCurve data={generateRocData(avgAuc)} />
        </figure>
        <figure style={{ margin: 0, border: "1px solid #dbe1ea", padding: "10px 12px" }}>
          <figcaption style={{ marginBottom: "8px", fontSize: "11px", fontWeight: 600 }}>{copy.sections.riskDistribution}</figcaption>
          <ChartRiskDistribution data={riskDistData} />
        </figure>
        <figure style={{ margin: 0, border: "1px solid #dbe1ea", padding: "10px 12px" }}>
          <figcaption style={{ marginBottom: "8px", fontSize: "11px", fontWeight: 600 }}>{copy.sections.attackComparison}</figcaption>
          <ChartAttackComparison data={attackComparisonData} />
        </figure>
      </section>

      {gapData.length > 0 && (
        <section style={{ marginBottom: "16px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 650 }}>{copy.sections.coverageGaps}</h2>
          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>
            {gapData.length} {copy.sections.highRiskGaps}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", border: "1px solid #dbe1ea" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>{copy.tableHeaders.attack}</th>
                <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>{copy.tableHeaders.defense}</th>
                <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>AUC</th>
              </tr>
            </thead>
            <tbody>
              {gapData.map((gap) => (
                <tr key={`${gap.attack}-${gap.defense}-${gap.auc}`}>
                  <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7" }}>{gap.attack}</td>
                  <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7" }}>{gap.defense}</td>
                  <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7", textAlign: "right", fontFamily: "monospace" }}>{gap.auc.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section style={{ marginBottom: "16px" }}>
        <CompareView rows={rows} locale={locale} />
      </section>

      <section style={{ marginBottom: "16px" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 650 }}>{copy.sections.coverageGaps}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", border: "1px solid #dbe1ea" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>{copy.tableHeaders.contractKey}</th>
              <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>{copy.tableHeaders.label}</th>
              <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>{copy.tableHeaders.systemGap}</th>
              <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>{copy.tableHeaders.workspace}</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.contractKey}>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7", fontFamily: "monospace" }}>{contract.contractKey}</td>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7" }}>{contract.label}</td>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7" }}>{contract.systemGap}</td>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7" }}>{contract.bestWorkspace}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 650 }}>{copy.sections.auditResults}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", border: "1px solid #dbe1ea" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>{copy.tableHeaders.attack}</th>
              <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>{copy.tableHeaders.defense}</th>
              <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>{copy.tableHeaders.model}</th>
              <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>{copy.tableHeaders.track}</th>
              <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>{copy.tableHeaders.evidence}</th>
              <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>
                <MetricLabel label={copy.tableHeaders.auc} tooltip={copy.metricTooltips.auc} />
              </th>
              <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>
                <MetricLabel label={copy.tableHeaders.asr} tooltip={copy.metricTooltips.asr} />
              </th>
              <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>
                <MetricLabel label={copy.tableHeaders.tpr} tooltip={copy.metricTooltips.tpr} />
              </th>
              <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #dbe1ea" }}>{copy.tableHeaders.risk}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.attack}-${row.defense}-${row.model}`}>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7" }}>{row.attack}</td>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7" }}>{row.defense}</td>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7" }}>{row.model}</td>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7" }}>
                  <StatusBadge tone="info">{row.track}</StatusBadge>
                </td>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7", verticalAlign: "top" }}>
                  <div style={{ display: "grid", gap: "4px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        width: "fit-content",
                        alignItems: "center",
                        borderRadius: "999px",
                        border: `1px solid ${evidenceAccent(row.evidenceLevel).border}`,
                        background: evidenceAccent(row.evidenceLevel).background,
                        color: evidenceAccent(row.evidenceLevel).color,
                        fontSize: "10px",
                        fontWeight: 600,
                        lineHeight: 1,
                        padding: "3px 8px",
                      }}
                    >
                      {row.evidenceLevel}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        width: "fit-content",
                        maxWidth: "240px",
                        alignItems: "center",
                        borderRadius: "999px",
                        border: "1px solid #dbe1ea",
                        background: "#f8fafc",
                        color: "#64748b",
                        fontSize: "10px",
                        lineHeight: 1.4,
                        padding: "3px 8px",
                      }}
                    >
                      {copy.tableHeaders.qualityCost}: {row.qualityCost}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7", textAlign: "right", fontFamily: "monospace" }}>{row.aucLabel}</td>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7", textAlign: "right", fontFamily: "monospace" }}>{row.asrLabel}</td>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7", textAlign: "right", fontFamily: "monospace" }}>{row.tprLabel}</td>
                <td style={{ padding: "7px 10px", borderBottom: "1px solid #eef2f7" }}>
                  <RiskBadge auc={parseFloat(row.aucLabel)} label={riskLabel(row.riskLevel, locale)} locale={locale} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
