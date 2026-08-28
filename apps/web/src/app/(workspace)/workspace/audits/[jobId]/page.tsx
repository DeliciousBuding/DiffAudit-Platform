import { useParams } from "react-router";

import { Breadcrumb } from "@/components/breadcrumb";
import { clientLocale } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { JobDetailClient } from "./JobDetailClient";

export default function JobDetailPage() {
  const { jobId } = useParams();
  const locale = clientLocale();
  const copy = WORKSPACE_COPY[locale].jobDetail;
  const isZh = locale === "zh-CN";

  const breadcrumbItems = [
    { label: isZh ? "工作台" : "Dashboard", href: "/workspace/start" },
    { label: isZh ? "审计任务" : "Audits", href: "/workspace/audits" },
    { label: jobId ?? "" },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumb items={breadcrumbItems} />

      {/* Page header */}
      <div className="border-b border-border pb-3">
        <h1 className="text-lg font-semibold">{copy.title}</h1>
      </div>

      <JobDetailClient jobId={jobId ?? ""} locale={locale} />
    </div>
  );
}
