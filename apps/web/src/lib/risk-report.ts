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
  .summary{display:grid;grid-template-columns:1.2fr 0.8fr;gap:18px;margin:28px 0}
  .summary-panel{border:1px solid #dbe1ea;border-radius:18px;padding:20px 22px;background:linear-gradient(180deg,#f8fafc 0%,#ffffff 100%)}
  .summary-title{font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;margin-bottom:12px;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  .summary-abstract{font-size:15px;line-height:1.8;color:#1f2937;margin:0}
  .summary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .summary-card{padding:14px 16px;border-radius:14px;background:#f8fafc;border:1px solid #e5e7eb}
  .summary-card .value{font-size:24px;font-weight:700;color:#111827;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  .summary-card .label{font-size:11px;color:#64748b;margin-top:6px;text-transform:uppercase;letter-spacing:0.08em;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  h2{margin:28px 0 12px;font-size:20px;line-height:1.2;font-weight:600}
  .section-note{margin:0 0 14px;font-size:13px;line-height:1.7;color:#64748b;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  .risk-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:12px}
  .risk-card{padding:16px;border-radius:16px;border:1px solid #e5e7eb;background:#fff}
  .risk-card .count{font-size:26px;font-weight:700;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  .risk-card .label{font-size:11px;margin-top:8px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  .risk-high{border-color:#fecaca;background:#fef2f2;color:#b91c1c}
  .risk-medium{border-color:#fde68a;background:#fffbeb;color:#b45309}
  .risk-low{border-color:#bbf7d0;background:#f0fdf4;color:#166534}
  .finding-list{display:grid;gap:10px;margin:0;padding:0;list-style:none}
  .finding-item{display:grid;grid-template-columns:1fr auto;gap:14px;padding:14px 16px;border:1px solid #e5e7eb;border-radius:14px;background:#fff}
  .finding-title{font-size:14px;font-weight:600;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  .finding-meta{margin-top:4px;font-size:12px;color:#64748b;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  .finding-score{font-size:20px;font-weight:700;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
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

  <section class="summary">
    <div class="summary-panel">
      <div class="summary-title">${summaryLabel}</div>
      <p class="summary-abstract">${isZh ? "本报告汇总当前可审计结果，给出风险等级分布、重点高风险样本、以及有防御/无防御之间的关键指标变化，用于支撑评审、归档和打印留档。" : "This report consolidates the current auditable results into a print-ready narrative covering risk distribution, top high-risk findings, and the metric shifts between defended and undefended runs."}</p>
    </div>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="value">${rows.length}</div>
        <div class="label">${totalLabel}</div>
      </div>
      <div class="summary-card">
        <div class="value">${summaryAuc}</div>
        <div class="label">${avgAucLabel}</div>
      </div>
      <div class="summary-card">
        <div class="value">${riskCounts.high}</div>
        <div class="label">${isZh ? "高风险样本" : "High Risk Rows"}</div>
      </div>
      <div class="summary-card">
        <div class="value">${comparisonRows.length}</div>
        <div class="label">${isZh ? "防御对照组" : "Defense Pairs"}</div>
      </div>
    </div>
  </section>

  <section>
    <h2>${riskOverviewLabel}</h2>
    <p class="section-note">${isZh ? "风险等级依据 AUC 阈值分层，用于快速判断当前审计结果中最需要优先处理的攻击面。" : "Risk levels are bucketed by AUC thresholds to quickly identify which attack surfaces deserve immediate attention."}</p>
    <div class="risk-overview">
      <div class="risk-card risk-high"><div class="count">${riskCounts.high}</div><div class="label">${riskLabel("high", locale)}</div></div>
      <div class="risk-card risk-medium"><div class="count">${riskCounts.medium}</div><div class="label">${riskLabel("medium", locale)}</div></div>
      <div class="risk-card risk-low"><div class="count">${riskCounts.low}</div><div class="label">${riskLabel("low", locale)}</div></div>
    </div>
  </section>

  <section>
    <h2>${findingsLabel}</h2>
    <p class="section-note">${isZh ? "下列样本按 AUC 从高到低排序，适合作为报告中的重点风险证据。" : "The following findings are ordered by AUC and provide the strongest evidence anchors for review and print distribution."}</p>
    <ul class="finding-list">
      ${highRiskRows.map(({ row, auc }) => {
        const level = classifyRisk(auc);
        return `<li class="finding-item">
          <div>
            <div class="finding-title">${row.attack} / ${row.defense}</div>
            <div class="finding-meta">${row.model} · ${row.track} · ${row.evidenceLevel}</div>
          </div>
          <div class="finding-score" style="color:${riskColor(level)}">${row.aucLabel}</div>
        </li>`;
      }).join("")}
    </ul>
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
