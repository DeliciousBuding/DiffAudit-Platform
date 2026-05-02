import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { JobDetailClient } from "./JobDetailClient";

type RenderJobDetailPageOptions = {
  params: Promise<{ jobId: string }>;
  locale?: Locale;
};

async function renderJobDetailPage({
  params,
  locale,
}: RenderJobDetailPageOptions) {
  const { jobId } = await params;
  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[resolvedLocale].jobDetail;

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Link
        href="/workspace/audits"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> {copy.backToAudits}
      </Link>

      {/* Page header */}
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-semibold">{copy.title}</h1>
      </div>

      <JobDetailClient jobId={jobId} locale={resolvedLocale} />
    </div>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  return renderJobDetailPage({ params });
}
