import Link from "@/lib/router/link";
import { Suspense, cache, use } from "react";

import { type Locale } from "@/components/language-picker";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import { clientLocale } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { getWorkspaceAttackDefenseData } from "@/lib/workspace-source";
import { RiskFindingsClient } from "./RiskFindingsClient";

const loadAttackDefense = cache(() => getWorkspaceAttackDefenseData());

function RiskFindingsLoaded({ locale }: { locale: Locale }) {
  const table = use(loadAttackDefense());
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
      <RiskFindingsClient rows={rows} locale={locale} />
    </WorkspacePageFrame>
  );
}

export default function RiskFindingsPage() {
  const locale = clientLocale();

  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/20" />}>
      <RiskFindingsLoaded locale={locale} />
    </Suspense>
  );
}
