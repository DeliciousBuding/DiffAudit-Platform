"use client";

import { useCallback } from "react";

import { generateReportHTML, type ReportExportRow } from "@/lib/risk-report";

export function ExportReportButton({
  rows,
  label,
  locale,
}: {
  rows: ReportExportRow[];
  label: string;
  locale: string;
}) {
  const handleClick = useCallback(() => {
    const html = generateReportHTML(rows, locale);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `DiffAudit-Report-${Date.now()}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [rows, locale]);

  return (
    <button
      type="button"
      className="portal-pill-sm portal-pill-sm-primary"
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
