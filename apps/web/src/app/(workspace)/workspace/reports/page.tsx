import { headers } from "next/headers";

import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import { ReportsPageClient } from "./ReportsPageClient";

export const dynamic = "force-dynamic";

type WorkspaceReportsPageOptions = {
  locale?: "en-US" | "zh-CN";
};

async function renderWorkspaceReportsPage({ locale }: WorkspaceReportsPageOptions = {}) {
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].reports;

  return (
    <WorkspacePageFrame title={copy.title} titleClassName="text-xl">
      <ReportsPageClient locale={resolvedLocale} />
    </WorkspacePageFrame>
  );
}

export default async function WorkspaceReportsPage() {
  return renderWorkspaceReportsPage();
}
