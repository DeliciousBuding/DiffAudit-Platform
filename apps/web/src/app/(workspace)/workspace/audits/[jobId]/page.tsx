import { headers } from "next/headers";

import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { JobDetailClient } from "./JobDetailClient";
import { Breadcrumb } from "@/components/breadcrumb";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const resolvedLocale = resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].jobDetail;
  const navItems = WORKSPACE_COPY[resolvedLocale].nav;

  return (
    <div className="space-y-4">
      <Breadcrumb items={[
        { label: navItems[0].title, href: "/workspace" },
        { label: navItems[1].title, href: "/workspace/audits" },
        { label: copy.title }
      ]} />

      {/* Page header */}
      <div className="border-b border-border pb-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {copy.eyebrow}
        </div>
        <h1 className="mt-1 text-lg font-semibold">{copy.title}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {copy.description}
        </p>
      </div>

      <JobDetailClient jobId={jobId} locale={resolvedLocale} />
    </div>
  );
}
