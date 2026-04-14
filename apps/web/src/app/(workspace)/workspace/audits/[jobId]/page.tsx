import { headers } from "next/headers";

import { type Locale } from "@/components/language-picker";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { JobDetailClient } from "./JobDetailClient";

export default async function JobDetailPage({
  params,
  locale,
}: {
  params: Promise<{ jobId: string }>;
  locale?: Locale;
}) {
  const { jobId } = await params;
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].jobDetail;

  return (
    <div className="space-y-4">
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
