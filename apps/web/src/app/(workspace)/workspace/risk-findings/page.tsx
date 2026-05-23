import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";

import { WorkspacePageFrame } from "@/components/workspace-frame";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { getWorkspaceAttackDefenseData } from "@/lib/workspace-source";
import { RiskFindingsClient } from "./RiskFindingsClient";

export const dynamic = "force-dynamic";

export default async function RiskFindingsPage() {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const table = await getWorkspaceAttackDefenseData();
  const rows = [...(table?.rows ?? [])]
    .filter((row) => !Number.isNaN(Number.parseFloat(row.aucLabel)))
    .sort((left, right) => Number.parseFloat(right.aucLabel) - Number.parseFloat(left.aucLabel));

  const copy = WORKSPACE_COPY[locale].riskFindings;

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
