import { Suspense, cache, use } from "react";

import { type Locale } from "@/components/language-picker";
import { clientLocale } from "@/lib/next-shims/runtime";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import { getWorkspaceAuditJobsData } from "@/lib/workspace-source";
import { ReportsPageClient } from "./ReportsPageClient";

const loadReportJobs = cache(() => getWorkspaceAuditJobsData());

function ReportsLoaded({ locale }: { locale: Locale }) {
  const initialJobs = use(loadReportJobs());

  return <ReportsPageClient locale={locale} initialJobs={initialJobs} />;
}

export default function WorkspaceReportsPage() {
  const locale = clientLocale();
  const copy = WORKSPACE_COPY[locale].reports;

  return (
    <WorkspacePageFrame title={copy.title} titleClassName="text-xl">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/20" />}>
        <ReportsLoaded locale={locale} />
      </Suspense>
    </WorkspacePageFrame>
  );
}
