import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";

import { WorkspacePageFrame } from "@/components/workspace-frame";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { getWorkspaceAttackDefenseData } from "@/lib/workspace-source";
import { RiskFindingsClient } from "./RiskFindingsClient";

export const dynamic = "force-dynamic";

export default async function RiskFindingsPage() {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const table = await getWorkspaceAttackDefenseData();
  const rows = [...(table?.rows ?? [])]
    .filter((row) => !Number.isNaN(Number.parseFloat(row.aucLabel)))
    .sort((left, right) => Number.parseFloat(right.aucLabel) - Number.parseFloat(left.aucLabel));

  const copy = locale === "zh-CN"
    ? {
      eyebrow: "风险发现",
      title: "风险发现",
      description: "追踪隐私泄露风险，查看证据链与缓解建议，降低模型安全风险。",
      viewReport: "查看完整报告",
    }
    : {
      eyebrow: "Risk Findings",
      title: "Risk Findings",
      description: "Track privacy leakage risks, evidence chains, and mitigation recommendations.",
      viewReport: "View full report",
    };

  return (
    <WorkspacePageFrame
      title={copy.title}
      titleClassName="text-xl"
      actions={
        <Link className="workspace-btn-primary px-4 py-2 text-sm" href="/workspace/reports">
          {copy.viewReport}
        </Link>
      }
    >
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/20" />}>
        <RiskFindingsClient rows={rows} locale={locale} />
      </Suspense>
    </WorkspacePageFrame>
  );
}
