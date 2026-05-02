"use client";

import { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";

import { type Locale } from "@/components/language-picker";
import { type AttackDefenseRowViewModel, type CatalogEntryViewModel } from "@/lib/workspace-source";
import { PrintableAuditReport } from "@/components/printable-audit-report";
import { buildReportCsv } from "@/components/export-report-button";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import {
  waitForPrintableWindow,
  buildPrintHtmlTemplate,
  buildCsvMetadataHeader,
  PDF_CLEANUP_TIMEOUT_MS,
} from "@/lib/report-export-utils";

interface ReportExportButtonsProps {
  rows: AttackDefenseRowViewModel[];
  locale: Locale;
  contracts: CatalogEntryViewModel[];
}

export function ReportExportButtons({ rows, locale, contracts }: ReportExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const copy = WORKSPACE_COPY[locale].reports;

  const exportAsPdf = useCallback(async () => {
    setExporting("pdf");
    setExportError(null);
    let printWindow: Window | null = null;
    let root: ReturnType<typeof createRoot> | null = null;
    let cleanupTimer: ReturnType<typeof setTimeout> | null = null;

    try {
      printWindow = window.open("", "_blank", "width=1120,height=900");
      if (!printWindow) {
        setExportError(copy.popupBlocked);
        return;
      }

      printWindow.document.open();
      printWindow.document.write(buildPrintHtmlTemplate(locale));
      printWindow.document.close();

      const mountNode = printWindow.document.getElementById("print-root");
      if (!mountNode) throw new Error("Printable report mount node is missing.");

      root = createRoot(mountNode);
      flushSync(() => {
        root!.render(
          <PrintableAuditReport locale={locale} rows={rows} contracts={contracts} />,
        );
      });

      await waitForPrintableWindow(printWindow);

      const cleanup = () => {
        if (cleanupTimer !== null) {
          clearTimeout(cleanupTimer);
          cleanupTimer = null;
        }
        root?.unmount();
        root = null;
        printWindow?.close();
        printWindow = null;
      };

      // Timeout cleanup: if onafterprint never fires, force-close after 60s
      cleanupTimer = setTimeout(() => {
        cleanup();
        setExportError(copy.exportTimeout);
      }, PDF_CLEANUP_TIMEOUT_MS);

      printWindow.onafterprint = cleanup;
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error("PDF export failed:", error);
      if (cleanupTimer !== null) clearTimeout(cleanupTimer);
      root?.unmount();
      printWindow?.close();
      setExportError(error instanceof Error ? error.message : String(error));
    } finally {
      setExporting(null);
    }
  }, [contracts, copy.exportTimeout, copy.popupBlocked, locale, rows]);

  const exportAsCsv = useCallback(() => {
    setExporting("csv");
    setExportError(null);
    let objectUrl: string | null = null;

    try {
      const csvContent = buildReportCsv(rows, locale);
      const metadata = buildCsvMetadataHeader(locale, rows.length);
      const fullCsv = metadata + "\n\n" + csvContent;
      const blob = new Blob([`﻿${fullCsv}`], { type: "text/csv;charset=utf-8;" });
      objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `diffaudit-report-${new Date().toISOString().slice(0, 10)}.csv`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("CSV export failed:", error);
      setExportError(error instanceof Error ? error.message : String(error));
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setExporting(null);
    }
  }, [locale, rows]);

  const btnBase =
    "rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-50";

  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      <button
        type="button"
        className={`${btnBase} bg-[var(--accent-blue)] text-white border border-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] shadow-sm`}
        onClick={exportAsPdf}
        disabled={exporting !== null}
      >
        {exporting === "pdf" ? "..." : "PDF"}
      </button>
      <button
        type="button"
        disabled
        title={locale === "zh-CN" ? "DOCX 导出即将推出" : "DOCX export coming soon"}
        className={`${btnBase} border border-border text-muted-foreground/60 cursor-not-allowed`}
      >
        DOCX
      </button>
      <button
        type="button"
        disabled
        title={locale === "zh-CN" ? "PPTX 导出即将推出" : "PPTX export coming soon"}
        className={`${btnBase} border border-border text-muted-foreground/60 cursor-not-allowed`}
      >
        PPTX
      </button>
      <button
        type="button"
        className={`${btnBase} border border-border text-foreground hover:bg-muted/30 hover:border-[var(--accent-blue)]/30`}
        onClick={exportAsCsv}
        disabled={exporting !== null}
      >
        {exporting === "csv" ? "..." : "CSV"}
      </button>
      {exportError ? (
        <p className="mt-1 w-full text-[10px] text-[color:var(--warning)]" role="alert">
          {exportError}
        </p>
      ) : null}
    </div>
  );
}
