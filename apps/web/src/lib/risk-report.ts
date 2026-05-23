import { WORKSPACE_COPY } from "./workspace-copy";

export type RiskLevel = "high" | "medium" | "low";

/** AUC threshold at or above which a result is classified as high risk. */
export const HIGH_RISK_AUC_THRESHOLD = 0.85;

/** Maximum number of coverage gaps to display in the report center. */
export const MAX_COVERAGE_GAPS = 10;

export function classifyRisk(auc: number): RiskLevel {
  if (auc > HIGH_RISK_AUC_THRESHOLD) return "high";
  if (auc >= 0.65) return "medium";
  return "low";
}

export function riskLabel(level: RiskLevel, locale: string): string {
  return WORKSPACE_COPY[locale as "en-US" | "zh-CN"].riskReport.riskLabels[level] ?? level;
}

export function defenseRecommendation(level: RiskLevel, locale: string): string {
  // Map risk level to a representative attack for contract lookup
  const attack = level === "high" ? "GSA" : level === "medium" ? "PIA" : "other";
  return WORKSPACE_COPY[locale as "en-US" | "zh-CN"].riskReport.defenseRecommendation(attack, "");
}

export interface ReportExportRow {
  track: string;
  attack: string;
  defense: string;
  model: string;
  aucLabel: string;
  asrLabel: string;
  tprLabel: string;
  evidenceLevel: string;
}

function riskColor(level: RiskLevel): string {
  if (level === "high") return "#dc2626";
  if (level === "medium") return "#f59e0b";
  return "#22c55e";
}

export function generateReportHTML(
  rows: ReportExportRow[],
  locale: string,
): string {
  const copy = WORKSPACE_COPY[locale as "en-US" | "zh-CN"].riskReport;
  const isZh = locale === "zh-CN";
  const now = new Date().toLocaleDateString(isZh ? "zh-CN" : "en-US");

  const aucValues = rows
    .map((r) => parseFloat(r.aucLabel))
    .filter((v) => !Number.isNaN(v));
  const avgAuc =
    aucValues.length > 0
      ? (aucValues.reduce((a, b) => a + b, 0) / aucValues.length).toFixed(3)
      : "n/a";

  const riskCounts = { high: 0, medium: 0, low: 0 };
  for (const v of aucValues) {
    riskCounts[classifyRisk(v)]++;
  }

  const worstRisk = (riskCounts.high > 0
    ? "high"
    : riskCounts.medium > 0
      ? "medium"
      : "low") as RiskLevel;
  const overallRec = defenseRecommendation(worstRisk, locale);

  const thStyle =
    "padding:10px 12px;text-align:left;font-weight:600;font-size:12px;color:#fff;white-space:nowrap;";
  const tdStyle =
    "padding:8px 12px;font-size:13px;border-bottom:1px solid #e5e7eb;";
  const monoStyle = "font-family:monospace;font-variant-numeric:tabular-nums;";

  const rowsHtml = rows
    .map((row) => {
      const auc = parseFloat(row.aucLabel);
      const level = Number.isNaN(auc) ? "low" : classifyRisk(auc);
      const color = riskColor(level as RiskLevel);
      const label = copy.riskLabels[level] ?? level;
      return `<tr>
        <td style="${tdStyle}">${row.attack}</td>
        <td style="${tdStyle}">${row.defense}</td>
        <td style="${tdStyle}">${row.model}</td>
        <td style="${tdStyle}">${row.track}</td>
        <td style="${tdStyle}${monoStyle}">${row.aucLabel}</td>
        <td style="${tdStyle}${monoStyle}">${row.asrLabel}</td>
        <td style="${tdStyle}${monoStyle}">${row.tprLabel}</td>
        <td style="${tdStyle}"><span style="color:${color};font-weight:600;">${label}</span></td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="${isZh ? "zh-CN" : "en"}">
<head>
<meta charset="utf-8">
<title>${copy.reportTitle}</title>
<style>
  body{font-family:-apple-system,"Microsoft YaHei","Segoe UI",sans-serif;max-width:960px;margin:0 auto;padding:40px 24px;color:#1a1a2e;background:#fff}
  h1{font-size:24px;font-weight:600;border-bottom:3px solid #e94560;padding-bottom:12px;margin-bottom:24px}
  .meta{font-size:13px;color:#6b7280;margin-bottom:32px}
  .summary{display:flex;gap:32px;padding:20px;background:#f8f9fa;border-radius:8px;margin-bottom:24px}
  .summary-item .value{font-size:28px;font-weight:700;color:#1a1a2e}
  .summary-item .label{font-size:12px;color:#6b7280;margin-top:2px}
  h2{font-size:18px;font-weight:600;margin:24px 0 12px}
  .risk-overview{display:flex;gap:16px;margin-bottom:24px}
  .risk-card{flex:1;padding:16px;border-radius:8px;text-align:center}
  .risk-card .count{font-size:24px;font-weight:700}
  .risk-card .label{font-size:12px;margin-top:4px}
  .risk-high{background:#fef2f2;color:#dc2626}
  .risk-medium{background:#fffbeb;color:#f59e0b}
  .risk-low{background:#f0fdf4;color:#22c55e}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  thead{background:#1a1a2e}
  .conclusion{padding:20px;background:#f0f9ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;margin:24px 0}
  .conclusion p{margin:0;font-size:14px;line-height:1.8;color:#1e40af}
  footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af}
</style>
</head>
<body>
<h1>${copy.reportTitle}</h1>
<div class="meta">${copy.dateLabel}: ${now} &mdash; DiffAudit Platform</div>

<div class="summary">
  <div class="summary-item">
    <div class="value">${rows.length}</div>
    <div class="label">${copy.totalLabel}</div>
  </div>
  <div class="summary-item">
    <div class="value">${avgAuc}</div>
    <div class="label">${copy.avgAucLabel}</div>
  </div>
</div>

<h2>${copy.coverageTitle}</h2>
<div class="risk-overview">
  <div class="risk-card risk-high"><div class="count">${riskCounts.high}</div><div class="label">${copy.riskLabels.high}</div></div>
  <div class="risk-card risk-medium"><div class="count">${riskCounts.medium}</div><div class="label">${copy.riskLabels.medium}</div></div>
  <div class="risk-card risk-low"><div class="count">${riskCounts.low}</div><div class="label">${copy.riskLabels.low}</div></div>
</div>

<h2>${copy.findingsTitle}</h2>
<table>
<thead><tr>
  <th style="${thStyle}">Attack</th>
  <th style="${thStyle}">Defense</th>
  <th style="${thStyle}">Model</th>
  <th style="${thStyle}">Track</th>
  <th style="${thStyle}">AUC</th>
  <th style="${thStyle}">ASR</th>
  <th style="${thStyle}">TPR@1%FPR</th>
  <th style="${thStyle}">${copy.riskColLabel}</th>
</tr></thead>
<tbody>${rowsHtml}</tbody>
</table>

<h2>${copy.conclusionLabel}</h2>
<div class="conclusion">
  <p>${overallRec}</p>
</div>

<footer>${copy.footerLabel}</footer>
</body>
</html>`;
}
