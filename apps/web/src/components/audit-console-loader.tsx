"use client";

import dynamic from "next/dynamic";

const AuditConsole = dynamic(
  () => import("@/components/audit-console").then((mod) => mod.AuditConsole),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[28px] border border-border bg-white/40 p-6 text-sm text-muted-foreground dark:bg-white/5">
        正在加载检测控制台...
      </div>
    ),
  },
);

export function AuditConsoleLoader() {
  return <AuditConsole />;
}

