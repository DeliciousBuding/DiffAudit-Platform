import Link from "@/lib/router/link";
import { Suspense, use } from "react";
import { Plus } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { clientLocale } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import { getWorkspaceAuditJobsData, isWorkspaceDemoModeEnabled } from "@/lib/workspace-source";
import { stableLoad } from "@/lib/stable-promise";
import { AuditsPageClient } from "./AuditsPageClient";

const loadAuditJobs = () =>
  stableLoad(`workspace:audits:${isWorkspaceDemoModeEnabled() ? "demo" : "live"}`, () => getWorkspaceAuditJobsData());

function AuditsLoaded({ locale }: { locale: Locale }) {
  const initialJobs = use(loadAuditJobs());

  return <AuditsPageClient locale={locale} initialJobs={initialJobs} />;
}

export default function WorkspaceAuditsPage() {
  const locale = clientLocale();
  const copy = WORKSPACE_COPY[locale].audits;

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
        <AuditsLoaded locale={locale} />
      </Suspense>
    </WorkspacePageFrame>
  );
}
