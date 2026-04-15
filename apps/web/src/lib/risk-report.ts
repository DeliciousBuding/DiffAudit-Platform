import type { AttackDefenseRowViewModel } from "@/lib/attack-defense-table";

export type RiskLevel = "high" | "medium" | "low";

export function classifyRisk(auc: number): RiskLevel {
  if (auc > 0.85) return "high";
  if (auc >= 0.65) return "medium";
  return "low";
}

export function riskLabel(level: RiskLevel, locale: string): string {
  if (locale === "zh-CN") {
    return level === "high" ? "高风险" : level === "medium" ? "中风险" : "低风险";
  }
  return level === "high" ? "High" : level === "medium" ? "Medium" : "Low";
}

export function defenseRecommendation(level: RiskLevel, locale: string): string {
  if (locale === "zh-CN") {
    if (level === "high")
      return "建议采用差分隐私(DP)训练。实验表明 DP 可将最强攻击(GSA)的 AUC 从 0.998 降至 0.489，接近随机猜测水平。";
    if (level === "medium")
      return "建议采用随机 Dropout 防御策略。实验表明 Dropout 可将灰盒攻击(PIA)的 AUC 从 0.841 降至 0.828，同时保持生成质量。";
    return "当前模型隐私保护良好，建议定期复测以监控潜在风险。";
  }
  if (level === "high")
    return "Differential Privacy (DP) training is recommended. Experiments show DP reduces the strongest attack (GSA) AUC from 0.998 to 0.489, near random guessing.";
  if (level === "medium")
    return "Stochastic Dropout defense is recommended. Experiments show Dropout reduces gray-box attack (PIA) AUC from 0.841 to 0.828 while preserving generation quality.";
  return "Current model has good privacy protection. Regular re-testing is recommended to monitor potential risks.";
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
  const isZh = locale === "zh-CN";
  const now = new Date().toLocaleDateString(isZh ? "zh-CN" : "en-US");

  const title = isZh ? "扩散模型隐私审计报告" : "Diffusion Model Privacy Audit Report";
  const dateLabel = isZh ? "生成日期" : "Date";
  const summaryLabel = isZh ? "审计摘要" : "Audit Summary";
  const totalLabel = isZh ? "审计结果总数" : "Total Results";
  const avgAucLabel = isZh ? "平均攻击 AUC" : "Avg. Attack AUC";
  const riskOverviewLabel = isZh ? "风险概览" : "Risk Overview";
  const detailLabel = isZh ? "详细结果" : "Detailed Results";
  const conclusionLabel = isZh ? "结论与建议" : "Conclusions & Recommendations";
  const riskColLabel = isZh ? "风险等级" : "Risk";

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
      const label = riskLabel(level as RiskLevel, locale);
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

  const timestamp = new Date().toISOString();
  const version = "v0.1.0";
  const githubUrl = "github.com/DeliciousBuding/DiffAudit-Platform";

  return `<!DOCTYPE html>
<html lang="${isZh ? "zh-CN" : "en"}">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @media print{
    body{padding:20px}
    .no-print{display:none}
    table{page-break-inside:avoid}
    .risk-card,.summary-item,.conclusion{page-break-inside:avoid}
  }
  body{font-family:-apple-system,"Microsoft YaHei","Segoe UI",sans-serif;max-width:960px;margin:0 auto;padding:40px 24px;color:#1a1a2e;background:#fff}
  .header{display:flex;align-items:center;gap:16px;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #e94560}
  .header .logo{width:48px;height:48px;background:linear-gradient(135deg,#e94560,#ff6b6b);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:20px;flex-shrink:0}
  .header .title-block h1{font-size:24px;font-weight:600;margin:0;color:#1a1a2e}
  .header .title-block .subtitle{font-size:13px;color:#6b7280;margin-top:4px}
  .meta{font-size:13px;color:#6b7280;margin-bottom:32px}
  .summary{display:flex;gap:32px;padding:20px;background:#f8f9fa;border-radius:8px;margin-bottom:24px}
  .summary-item .value{font-size:28px;font-weight:700;color:#1a1a2e}
  .summary-item .label{font-size:12px;color:#6b7280;margin-top:2px}
  h2{font-size:18px;font-weight:600;margin:24px 0 12px}
  .risk-overview{display:flex;gap:16px;margin-bottom:24px}
  .risk-card{flex:1;padding:16px;border-radius:8px;text-align:center;page-break-inside:avoid}
  .risk-card .count{font-size:24px;font-weight:700}
  .risk-card .label{font-size:12px;margin-top:4px}
  .risk-high{background:#fef2f2;color:#dc2626}
  .risk-medium{background:#fffbeb;color:#f59e0b}
  .risk-low{background:#f0fdf4;color:#22c55e}
  table{width:100%;border-collapse:collapse;margin:16px 0;page-break-inside:avoid}
  thead{background:#1a1a2e}
  tbody tr:nth-child(even){background:#f9fafb}
  tbody tr:hover{background:#f3f4f6}
  .conclusion{padding:20px;background:#f0f9ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;margin:24px 0;page-break-inside:avoid}
  .conclusion p{margin:0;font-size:14px;line-height:1.8;color:#1e40af}
  footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center;line-height:1.6}
  footer a{color:#3b82f6;text-decoration:none}
  footer a:hover{text-decoration:underline}
</style>
</head>
<body>
<div class="header">
  <div class="logo">DA</div>
  <div class="title-block">
    <h1>${title}</h1>
    <div class="subtitle">${dateLabel}: ${now} &mdash; DiffAudit Platform</div>
  </div>
</div>

<div class="summary">
  <div class="summary-item">
    <div class="value">${rows.length}</div>
    <div class="label">${totalLabel}</div>
  </div>
  <div class="summary-item">
    <div class="value">${avgAuc}</div>
    <div class="label">${avgAucLabel}</div>
  </div>
</div>

<h2>${riskOverviewLabel}</h2>
<div class="risk-overview">
  <div class="risk-card risk-high"><div class="count">${riskCounts.high}</div><div class="label">${riskLabel("high", locale)}</div></div>
  <div class="risk-card risk-medium"><div class="count">${riskCounts.medium}</div><div class="label">${riskLabel("medium", locale)}</div></div>
  <div class="risk-card risk-low"><div class="count">${riskCounts.low}</div><div class="label">${riskLabel("low", locale)}</div></div>
</div>

<h2>${detailLabel}</h2>
<table>
<thead><tr>
  <th style="${thStyle}">Attack</th>
  <th style="${thStyle}">Defense</th>
  <th style="${thStyle}">Model</th>
  <th style="${thStyle}">Track</th>
  <th style="${thStyle}">AUC</th>
  <th style="${thStyle}">ASR</th>
  <th style="${thStyle}">TPR@1%FPR</th>
  <th style="${thStyle}">${riskColLabel}</th>
</tr></thead>
<tbody>${rowsHtml}</tbody>
</table>

<h2>${conclusionLabel}</h2>
<div class="conclusion">
  <p>${overallRec}</p>
</div>

<footer>
  Generated by DiffAudit ${version} | ${timestamp}<br>
  <a href="https://${githubUrl}" target="_blank">${githubUrl}</a>
</footer>
</body>
</html>`;
}
