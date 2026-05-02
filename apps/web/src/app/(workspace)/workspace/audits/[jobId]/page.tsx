import { headers } from "next/headers";

import { type Locale } from "@/components/language-picker";
import { Breadcrumb } from "@/components/breadcrumb";
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
  const isZh = resolvedLocale === "zh-CN";

  const breadcrumbItems = [
    { label: isZh ? "工作台" : "Dashboard", href: "/workspace/start" },
    { label: isZh ? "审计任务" : "Audits", href: "/workspace/audits" },
    { label: jobId },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumb items={breadcrumbItems} />

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
