import { headers } from "next/headers";
import Link from "next/link";

import { RiskBadge } from "@/components/risk-badge";
import { StatusBadge } from "@/components/status-badge";
import { WorkspacePageFrame, WorkspaceSectionCard } from "@/components/workspace-frame";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { classifyRisk, riskLabel } from "@/lib/risk-report";
import { getWorkspaceAttackDefenseData } from "@/lib/workspace-source";

export const dynamic = "force-dynamic";

export default async function RiskFindingsPage() {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const table = await getWorkspaceAttackDefenseData();
  const rows = [...(table?.rows ?? [])]
    .filter((row) => !Number.isNaN(Number.parseFloat(row.aucLabel)))
    .sort((left, right) => Number.parseFloat(right.aucLabel) - Number.parseFloat(left.aucLabel));
  const highCount = rows.filter((row) => classifyRisk(Number.parseFloat(row.aucLabel)) === "high").length;
  const avgRisk = rows.length > 0
    ? Math.round(rows.reduce((sum, row) => sum + Number.parseFloat(row.aucLabel), 0) / rows.length * 100)
    : 0;
  const selected = rows[0] ?? null;
  const copy = locale === "zh-CN"
    ? {
      eyebrow: "风险发现",
      title: "风险发现",
      description: "追踪隐私泄露风险，查看证据链与缓解建议，降低模型安全风险。",
      weekly: "本周发现",
      score: "风险评分",
      list: "风险列表",
      detail: "风险详情",
      evidence: "证据链",
      advice: "缓解建议",
      viewReport: "查看完整报告",
      empty: "暂无风险发现。",
    }
    : {
      eyebrow: "Risk Findings",
      title: "Risk Findings",
      description: "Track privacy leakage risks, evidence chains, and mitigation recommendations.",
      weekly: "Findings this week",
      score: "Risk score",
      list: "Risk list",
      detail: "Risk detail",
      evidence: "Evidence chain",
      advice: "Mitigation advice",
      viewReport: "View full report",
      empty: "No risk findings available.",
    };

  return (
    <WorkspacePageFrame
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      actions={<Link className="workspace-btn-primary px-4 py-2 text-sm" href="/workspace/reports">{copy.viewReport}</Link>}
    >
      <div className="workspace-risk-summary">
        <div>
          <span>{copy.weekly}</span>
          <strong>{rows.length}</strong>
          <small>{highCount} {riskLabel("high", locale)}</small>
        </div>
        <div>
          <span>{copy.score}</span>
          <strong>{avgRisk}</strong>
          <StatusBadge tone={avgRisk >= 70 ? "warning" : avgRisk >= 45 ? "warning" : "success"} compact>
            {avgRisk >= 70 ? riskLabel("high", locale) : avgRisk >= 45 ? riskLabel("medium", locale) : riskLabel("low", locale)}
          </StatusBadge>
        </div>
      </div>

      <div className="workspace-page-with-rail">
        <div className="workspace-page-primary">
          <WorkspaceSectionCard title={copy.list}>
            <div className="divide-y divide-border/70">
              {rows.length > 0 ? rows.slice(0, 8).map((row, index) => {
                const auc = Number.parseFloat(row.aucLabel);
                const risk = classifyRisk(auc);
                return (
                  <article key={`${row.track}-${row.attack}-${row.defense}-${row.model}-${index}`} className="workspace-risk-row">
                    <span className="workspace-action-icon">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-foreground">{row.attack} / {row.defense}</h2>
                        <RiskBadge auc={auc} label={riskLabel(risk, locale)} locale={locale} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{row.model} · {row.track}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-muted-foreground">AUC</div>
                      <div className="text-lg font-bold text-foreground">{row.aucLabel}</div>
                    </div>
                  </article>
                );
              }) : <p className="p-4 text-sm text-muted-foreground">{copy.empty}</p>}
            </div>
          </WorkspaceSectionCard>
        </div>

        <aside className="workspace-page-rail">
          <section className="workspace-inspector-card">
            <div className="workspace-inspector-card-header"><h2>{copy.detail}</h2></div>
            <div className="grid gap-4 p-4">
              {selected ? (
                <>
                  <div>
                    <div className="text-lg font-bold text-foreground">{selected.attack}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{selected.note}</p>
                  </div>
                  <div className="workspace-inspector-metric"><span>AUC</span><strong>{selected.aucLabel}</strong></div>
                  <div className="workspace-inspector-metric"><span>ASR</span><strong>{selected.asrLabel}</strong></div>
                  <div className="workspace-inspector-metric"><span>{copy.evidence}</span><strong>{selected.evidenceLevel}</strong></div>
                  <WorkspaceSectionCard title={copy.advice}>
                    <p className="p-4 text-sm leading-6 text-muted-foreground">
                      {locale === "zh-CN" ? "优先比较防御策略，补齐证据链，并在报告中心导出面向团队的修复摘要。" : "Compare defenses first, close evidence gaps, and export a remediation summary from Report Center."}
                    </p>
                  </WorkspaceSectionCard>
                </>
              ) : <p className="text-sm text-muted-foreground">{copy.empty}</p>}
            </div>
          </section>
        </aside>
      </div>
    </WorkspacePageFrame>
  );
}
