import { Suspense, use } from "react";

import { type Locale } from "@/components/language-picker";
import { clientLocale } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import { getWorkspaceAuditJobsData, isWorkspaceDemoModeEnabled } from "@/lib/workspace-source";
import { stableLoad } from "@/lib/stable-promise";
import { ReportsPageClient } from "./ReportsPageClient";

const loadReportJobs = () =>
  stableLoad(`workspace:reports:${isWorkspaceDemoModeEnabled() ? "demo" : "live"}`, () => getWorkspaceAuditJobsData());

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
