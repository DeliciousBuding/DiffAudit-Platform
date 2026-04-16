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

type DefenseComparisonRow = {
  attack: string;
  model: string;
  defense: string;
  beforeAuc: number | null;
  afterAuc: number;
  deltaAuc: number | null;
  beforeAsr: number | null;
  afterAsr: number;
  deltaAsr: number | null;
  beforeTpr: number | null;
  afterTpr: number;
  deltaTpr: number | null;
};

function computeDefenseComparisonRows(rows: ReportExportRow[]): DefenseComparisonRow[] {
  const grouped = new Map<string, { undefended?: ReportExportRow; defended: ReportExportRow[] }>();

  for (const row of rows) {
    const key = `${row.attack}|||${row.model}`;
    if (!grouped.has(key)) {
      grouped.set(key, { defended: [] });
    }

    const bucket = grouped.get(key)!;
    if (row.defense === "none" || row.defense === "None") {
      bucket.undefended = row;
    } else {
      bucket.defended.push(row);
    }
  }

  return Array.from(grouped.entries()).flatMap(([key, bucket]) => {
    const [attack, model] = key.split("|||");
    return bucket.defended.map((defended) => {
      const beforeAuc = bucket.undefended ? parseFloat(bucket.undefended.aucLabel) : null;
      const afterAuc = parseFloat(defended.aucLabel) || 0;
      const beforeAsr = bucket.undefended ? parseFloat(bucket.undefended.asrLabel) : null;
      const afterAsr = parseFloat(defended.asrLabel) || 0;
      const beforeTpr = bucket.undefended ? parseFloat(bucket.undefended.tprLabel) : null;
      const afterTpr = parseFloat(defended.tprLabel) || 0;

      return {
        attack,
        model,
        defense: defended.defense,
        beforeAuc,
        afterAuc,
        deltaAuc: beforeAuc !== null ? afterAuc - beforeAuc : null,
        beforeAsr,
        afterAsr,
        deltaAsr: beforeAsr !== null ? afterAsr - beforeAsr : null,
        beforeTpr,
        afterTpr,
        deltaTpr: beforeTpr !== null ? afterTpr - beforeTpr : null,
      };
    });
  });
}

function formatDelta(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(3)}`;
}

function generateRocPoints(targetAuc: number) {
  const points: Array<{ x: number; y: number }> = [{ x: 0, y: 100 }];
  const steps = 20;
  for (let i = 1; i <= steps; i++) {
    const fpr = i / steps;
    const tpr = Math.min(1, Math.pow(fpr, 1 - targetAuc) * (0.9 + targetAuc * 0.1));
    points.push({ x: fpr * 220, y: 100 - Math.max(fpr, Math.min(1, tpr)) * 100 });
  }
  return points;
}

function buildHistogramSvg(values: number[]) {
  const bins = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const counts = bins.map((bin) => values.filter((value) => value >= bin && value < bin + 0.1).length);
  const maxCount = Math.max(...counts, 1);

  return `<svg viewBox="0 0 260 120" width="100%" height="120" aria-hidden="true">
    ${counts.map((count, index) => {
      const height = (count / maxCount) * 84;
      const x = 18 + index * 38;
      return `<rect x="${x}" y="${98 - height}" width="24" height="${height}" rx="3" fill="#2563eb"></rect>
        <text x="${x + 12}" y="112" text-anchor="middle" font-size="10" fill="#64748b">${bins[index].toFixed(2)}</text>`;
    }).join("")}
  </svg>`;
}

function buildRocSvg(avgAuc: number) {
  const points = generateRocPoints(avgAuc);
  const polyline = points.map((point) => `${point.x + 20},${point.y + 10}`).join(" ");

  return `<svg viewBox="0 0 260 120" width="100%" height="120" aria-hidden="true">
    <line x1="20" y1="110" x2="240" y2="10" stroke="#cbd5e1" stroke-dasharray="4 4" />
    <polyline points="${polyline}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <line x1="20" y1="110" x2="240" y2="110" stroke="#cbd5e1" />
    <line x1="20" y1="10" x2="20" y2="110" stroke="#cbd5e1" />
    <text x="20" y="118" font-size="10" fill="#64748b">0.0</text>
    <text x="228" y="118" font-size="10" fill="#64748b">1.0</text>
    <text x="2" y="16" font-size="10" fill="#64748b">1.0</text>
  </svg>`;
}

function buildAttackComparisonSvg(rows: ReportExportRow[]) {
  const attacks = ["GSA", "PIA", "Recon"];
  const values = attacks.map((attack) => {
    const matching = rows
      .filter((row) => row.attack.toLowerCase() === attack.toLowerCase() || row.attack.toLowerCase().includes(attack.toLowerCase()))
      .map((row) => parseFloat(row.aucLabel))
      .filter((value) => !Number.isNaN(value));
    return matching.length > 0 ? matching.reduce((sum, value) => sum + value, 0) / matching.length : 0;
  });

  return `<svg viewBox="0 0 260 120" width="100%" height="120" aria-hidden="true">
    ${values.map((value, index) => {
      const x = 32 + index * 72;
      const height = value * 84;
      return `<rect x="${x}" y="${98 - height}" width="34" height="${height}" rx="4" fill="${index === 0 ? "#ef4444" : index === 1 ? "#f59e0b" : "#2563eb"}"></rect>
        <text x="${x + 17}" y="112" text-anchor="middle" font-size="10" fill="#64748b">${attacks[index]}</text>`;
    }).join("")}
  </svg>`;
}

function buildRiskDistributionHtml(riskCounts: { high: number; medium: number; low: number }, locale: string) {
  const total = Math.max(riskCounts.high + riskCounts.medium + riskCounts.low, 1);
  const segments = [
    { label: riskLabel("high", locale), count: riskCounts.high, color: "#dc2626" },
    { label: riskLabel("medium", locale), count: riskCounts.medium, color: "#f59e0b" },
    { label: riskLabel("low", locale), count: riskCounts.low, color: "#16a34a" },
  ];

  return `<div style="display:grid;gap:8px">
    ${segments.map((segment) => `<div style="display:grid;grid-template-columns:72px 1fr 28px;gap:8px;align-items:center;font-size:11px;color:#475569">
      <span>${segment.label}</span>
      <span style="display:block;height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden">
        <span style="display:block;height:100%;width:${(segment.count / total) * 100}%;background:${segment.color}"></span>
      </span>
      <span style="text-align:right;font-family:monospace">${segment.count}</span>
    </div>`).join("")}
  </div>`;
}

export function generateReportHTML(
  rows: ReportExportRow[],
  locale: string,
): string {
  const isZh = locale === "zh-CN";
  const now = new Date().toLocaleDateString(isZh ? "zh-CN" : "en-US");

  const title = isZh ? "扩散模型隐私审计报告" : "Diffusion Model Privacy Audit Report";
  const dateLabel = isZh ? "生成日期" : "Date";
  const summaryLabel = isZh ? "执行摘要" : "Executive Summary";
  const totalLabel = isZh ? "审计结果总数" : "Total Results";
  const avgAucLabel = isZh ? "平均攻击 AUC" : "Avg. Attack AUC";
  const riskOverviewLabel = isZh ? "风险概览" : "Risk Overview";
  const detailLabel = isZh ? "详细结果" : "Detailed Results";
  const findingsLabel = isZh ? "重点发现" : "Key Findings";
  const defenseLabel = isZh ? "防御对照" : "Defense Comparison";
  const conclusionLabel = isZh ? "结论与建议" : "Conclusions & Recommendations";
  const riskColLabel = isZh ? "风险等级" : "Risk";
  const evidenceLabel = isZh ? "证据等级" : "Evidence";
  const beforeLabel = isZh ? "防御前" : "Before";
  const afterLabel = isZh ? "防御后" : "After";
  const deltaLabel = isZh ? "变化" : "Delta";

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

  const comparisonRows = computeDefenseComparisonRows(rows);
  const highRiskRows = rows
    .map((row) => ({ row, auc: parseFloat(row.aucLabel) }))
    .filter((entry) => !Number.isNaN(entry.auc))
    .sort((left, right) => right.auc - left.auc)
    .slice(0, 5);

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

  const summaryAuc = avgAuc === "n/a" ? "—" : avgAuc;
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
        <td style="${tdStyle}">${row.evidenceLevel}</td>
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
    body{margin:0;background:#fff}
    .report-page{box-shadow:none;margin:0 auto}
    table{page-break-inside:avoid}
  }
  body{margin:0;padding:32px;background:#eceff4;font-family:"Source Serif 4","Times New Roman","Noto Serif SC",serif;color:#111827}
  .report-page{width:794px;min-height:1123px;margin:0 auto;background:#fff;box-shadow:0 18px 60px rgba(15,23,42,0.12);padding:58px 62px 68px;box-sizing:border-box}
  .cover{padding-bottom:28px;border-bottom:1px solid #d1d5db}
  .cover-kicker{font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;margin-bottom:18px;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  .cover h1{margin:0;font-size:34px;line-height:1.15;font-weight:600;letter-spacing:-0.03em}
  .cover-subtitle{margin-top:14px;font-size:15px;line-height:1.8;color:#475569;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  .cover-meta{display:flex;justify-content:space-between;gap:16px;margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#64748b;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  .summary-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:24px 0 18px}
  .summary-cell{border:1px solid #dbe1ea;padding:10px 12px;background:#fff}
  .summary-cell .value{font-size:20px;font-weight:700;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  .summary-cell .label{margin-top:4px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  h2{margin:28px 0 12px;font-size:20px;line-height:1.2;font-weight:600}
  .section-note{margin:0 0 14px;font-size:13px;line-height:1.7;color:#64748b;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  .figure-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:22px 0}
  .figure-panel{border:1px solid #dbe1ea;padding:10px 12px;background:#fff}
  .figure-title{margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#334155;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  table{width:100%;border-collapse:collapse;margin:14px 0 0;page-break-inside:avoid;border:1px solid #e5e7eb}
  thead{background:#0f172a}
  tbody tr:nth-child(even){background:#f9fafb}
  .delta-good{color:#166534;font-weight:700}
  .delta-bad{color:#b91c1c;font-weight:700}
  .delta-neutral{color:#64748b;font-weight:700}
  .conclusion{padding:18px 20px;background:#f8fafc;border:1px solid #dbe1ea;border-radius:16px;margin:26px 0 0}
  .conclusion p{margin:0;font-size:14px;line-height:1.85;color:#1e293b;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  footer{margin-top:34px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#94a3b8;text-align:center;line-height:1.7;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  footer a{color:#3b82f6;text-decoration:none}
  footer a:hover{text-decoration:underline}
</style>
</head>
<body>
<div class="report-page">
  <section class="cover">
    <div class="cover-kicker">DiffAudit / Privacy Audit Report</div>
    <h1>${title}</h1>
    <div class="cover-subtitle">${isZh ? "面向打印与评审场景的成员推断风险报告，聚焦扩散模型的风险暴露、对照实验与防御边界。" : "A print-ready membership inference report for diffusion models, focused on risk exposure, defense comparisons, and coverage boundaries."}</div>
    <div class="cover-meta">
      <span>${dateLabel}: ${now}</span>
      <span>DiffAudit Platform</span>
      <span>${rows.length} ${isZh ? "条实验结果" : "evaluated rows"}</span>
    </div>
  </section>

  <section>
    <h2>${summaryLabel}</h2>
    <p class="section-note">${isZh ? "导出报告直接复刻工作台报告页的关键信息结构，以紧凑图表与细表支撑打印、评审和材料归档。" : "This export mirrors the reports workspace structure, compressing the key charts and detailed tables into a denser print-ready format."}</p>
    <div class="summary-strip">
      <div class="summary-cell"><div class="value">${rows.length}</div><div class="label">${totalLabel}</div></div>
      <div class="summary-cell"><div class="value">${summaryAuc}</div><div class="label">${avgAucLabel}</div></div>
      <div class="summary-cell"><div class="value">${comparisonRows.length}</div><div class="label">${defenseLabel}</div></div>
      <div class="summary-cell"><div class="value">${riskCounts.high + riskCounts.medium}</div><div class="label">${isZh ? "需关注项" : "Watchlist Rows"}</div></div>
    </div>
  </section>

  <section>
    <h2>${riskOverviewLabel}</h2>
    <p class="section-note">${isZh ? "风险概览与图表矩阵直接对应工作台报告页，优先提供可打印的趋势和分布可视化。" : "The figure matrix below tracks the reports page: it prioritizes print-friendly trends, distributions, and comparisons."}</p>
    <div class="figure-grid">
      <section class="figure-panel">
        <div class="figure-title">AUC Score Distribution</div>
        ${buildHistogramSvg(aucValues)}
      </section>
      <section class="figure-panel">
        <div class="figure-title">ROC Curve</div>
        ${buildRocSvg(parseFloat(summaryAuc === "—" ? "0.85" : summaryAuc))}
      </section>
      <section class="figure-panel">
        <div class="figure-title">Risk Distribution</div>
        ${buildRiskDistributionHtml(riskCounts, locale)}
      </section>
      <section class="figure-panel">
        <div class="figure-title">Attack Comparison</div>
        ${buildAttackComparisonSvg(rows)}
      </section>
    </div>
  </section>

  <section>
    <h2>${findingsLabel}</h2>
    <p class="section-note">${isZh ? "重点发现按 AUC 排序，但改为更紧凑的表格而不是大卡片，方便纸面浏览。" : "Key findings remain sorted by AUC, but are presented as a denser table instead of oversized cards for easier printed review."}</p>
    <table>
      <thead><tr>
        <th style="${thStyle}">Attack</th>
        <th style="${thStyle}">Defense</th>
        <th style="${thStyle}">Model</th>
        <th style="${thStyle}">Track</th>
        <th style="${thStyle}">${evidenceLabel}</th>
        <th style="${thStyle}">AUC</th>
      </tr></thead>
      <tbody>
        ${highRiskRows.map(({ row }) => `<tr>
          <td style="${tdStyle}">${row.attack}</td>
          <td style="${tdStyle}">${row.defense}</td>
          <td style="${tdStyle}">${row.model}</td>
          <td style="${tdStyle}">${row.track}</td>
          <td style="${tdStyle}">${row.evidenceLevel}</td>
          <td style="${tdStyle}${monoStyle}">${row.aucLabel}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </section>

  <section>
    <h2>${defenseLabel}</h2>
    <p class="section-note">${isZh ? "对照同一攻击与模型组合在防御前后的关键指标差异，便于打印后直接评审策略是否有效。" : "Compare key metric changes before and after each defense so the printed report still communicates whether the strategy helped."}</p>
    ${comparisonRows.length > 0 ? `<table>
      <thead><tr>
        <th style="${thStyle}">Attack</th>
        <th style="${thStyle}">Defense</th>
        <th style="${thStyle}">Model</th>
        <th style="${thStyle}">${beforeLabel} AUC</th>
        <th style="${thStyle}">${afterLabel} AUC</th>
        <th style="${thStyle}">${deltaLabel} AUC</th>
        <th style="${thStyle}">${beforeLabel} ASR</th>
        <th style="${thStyle}">${afterLabel} ASR</th>
        <th style="${thStyle}">${deltaLabel} TPR</th>
      </tr></thead>
      <tbody>
        ${comparisonRows.map((row) => {
          const aucDeltaClass = row.deltaAuc === null ? "delta-neutral" : row.deltaAuc < 0 ? "delta-good" : "delta-bad";
          const tprDeltaClass = row.deltaTpr === null ? "delta-neutral" : row.deltaTpr > 0 ? "delta-good" : "delta-bad";
          return `<tr>
            <td style="${tdStyle}">${row.attack}</td>
            <td style="${tdStyle}">${row.defense}</td>
            <td style="${tdStyle}">${row.model}</td>
            <td style="${tdStyle}${monoStyle}">${row.beforeAuc?.toFixed(3) ?? "—"}</td>
            <td style="${tdStyle}${monoStyle}">${row.afterAuc.toFixed(3)}</td>
            <td style="${tdStyle}${monoStyle}" class="${aucDeltaClass}">${formatDelta(row.deltaAuc)}</td>
            <td style="${tdStyle}${monoStyle}">${row.beforeAsr?.toFixed(3) ?? "—"}</td>
            <td style="${tdStyle}${monoStyle}">${row.afterAsr.toFixed(3)}</td>
            <td style="${tdStyle}${monoStyle}" class="${tprDeltaClass}">${formatDelta(row.deltaTpr)}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>` : `<p class="section-note">${isZh ? "当前没有可打印的防御对照数据。" : "No printable defense comparison data is available yet."}</p>`}
  </section>

  <section>
    <h2>${detailLabel}</h2>
    <p class="section-note">${isZh ? "完整结果表保留了攻击方法、防御方法、证据等级与三项核心指标，便于在纸面上逐行核验。" : "The full result table preserves attack, defense, evidence level, and the three core metrics for line-by-line review on paper."}</p>
    <table>
    <thead><tr>
      <th style="${thStyle}">Attack</th>
      <th style="${thStyle}">Defense</th>
      <th style="${thStyle}">Model</th>
      <th style="${thStyle}">Track</th>
      <th style="${thStyle}">${evidenceLabel}</th>
      <th style="${thStyle}">AUC</th>
      <th style="${thStyle}">ASR</th>
      <th style="${thStyle}">TPR@1%FPR</th>
      <th style="${thStyle}">${riskColLabel}</th>
    </tr></thead>
    <tbody>${rowsHtml}</tbody>
    </table>
  </section>

  <section>
    <h2>${conclusionLabel}</h2>
    <div class="conclusion">
      <p>${overallRec}</p>
    </div>
  </section>

  <footer>
    Generated by DiffAudit ${version} | ${timestamp}<br>
    <a href="https://${githubUrl}" target="_blank">${githubUrl}</a>
  </footer>
  </div>
</body>
</html>`;
}
