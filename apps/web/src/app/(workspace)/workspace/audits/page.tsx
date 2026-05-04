import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import { sanitizeAuditJobPayload } from "@/lib/audit-job-payload";
import { isDemoModeEnabledServer } from "@/lib/demo-mode";
import { listDemoJobs } from "@/lib/demo-jobs-store";
import { AuditsPageClient } from "./AuditsPageClient";

type WorkspaceAuditsPageOptions = {
  locale?: "en-US" | "zh-CN";
};

async function renderWorkspaceAuditsPage({ locale }: WorkspaceAuditsPageOptions = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].audits;
  const initialJobs = await isDemoModeEnabledServer()
    ? sanitizeAuditJobPayload(listDemoJobs())
    : [];

  return (
    <WorkspacePageFrame
      title={copy.title}
      description={copy.description}
      titleClassName="text-xl"
      descriptionClassName="text-sm"
      actions={
        <Link
          href="/workspace/audits/new"
          className="audits-create-btn"
        >
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          {copy.createTaskButton}
        </Link>
      }
    >
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/20" />}>
        <AuditsPageClient locale={resolvedLocale} initialJobs={initialJobs} />
      </Suspense>
    </WorkspacePageFrame>
  );
}

export default async function WorkspaceAuditsPage() {
  return renderWorkspaceAuditsPage();
}
