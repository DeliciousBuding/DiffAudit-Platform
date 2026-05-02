import { headers } from "next/headers";
import Link from "next/link";
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
      actions={
        <Link
          href="/workspace/audits/new"
          className="workspace-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold shrink-0 shadow-sm hover:shadow-md transition-shadow"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {copy.createTaskButton}
        </Link>
      }
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
