import { headers } from "next/headers";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import { AuditsPageClient } from "./AuditsPageClient";

type WorkspaceAuditsPageOptions = {
  locale?: "en-US" | "zh-CN";
};

async function renderWorkspaceAuditsPage({ locale }: WorkspaceAuditsPageOptions = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].audits;

  return (
    <WorkspacePageFrame
      title={copy.title}
      titleClassName="text-xl"
    >
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/20" />}>
        <AuditsPageClient locale={resolvedLocale} />
      </Suspense>
    </WorkspacePageFrame>
  );
}

export default async function WorkspaceAuditsPage() {
  return renderWorkspaceAuditsPage();
}
