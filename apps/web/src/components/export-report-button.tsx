"use client";

import { RefreshCw, FileText, ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";

import type { CatalogEntryViewModel } from "@/lib/catalog";
import type { AttackDefenseRowViewModel } from "@/lib/attack-defense-table";
import { PrintableAuditReport } from "@/components/printable-audit-report";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { type Locale } from "@/components/language-picker";
import {
  waitForPrintableWindow,
  buildPrintHtmlTemplate,
  buildCsvMetadataHeader,
  PDF_CLEANUP_TIMEOUT_MS,
} from "@/lib/report-export-utils";

interface ExportReportButtonProps {
  rows: AttackDefenseRowViewModel[];
  contracts: CatalogEntryViewModel[];
  label: string;
  locale: Locale;
}

export function sanitizeCsvField(field: unknown) {
  let value = String(field ?? "");
  value = value.replace(/\r\n?/g, "\n");
  if (/^[=+\-@]/.test(value)) {
    value = `'${value}`;
  }
  return `"${value.replace(/"/g, "\"\"")}"`;
}

function resolveCsvHeaders(locale: Locale) {
  const headers = WORKSPACE_COPY[locale].reports.tableHeaders;
  return [
    headers.track,
    headers.attack,
    headers.defense,
    headers.model,
    headers.auc,
    headers.asr,
    headers.tpr,
    headers.evidence,
  ];
}

export function buildReportCsv(rows: AttackDefenseRowViewModel[], locale: Locale) {
  return [
    resolveCsvHeaders(locale).map(sanitizeCsvField).join(","),
    ...rows.map((row) => [
      row.track,
      row.attack,
      row.defense,
      row.model,
      row.aucLabel,
      row.asrLabel,
      row.tprLabel,
      row.evidenceLevel,
    ].map(sanitizeCsvField).join(",")),
  ].join("\n");
}

/**
 * ExportReportButton — report export control (PDF / CSV).
 *
 * Migrated from the hand-rolled `useFloatingMenu` menu (with manual
 * ArrowDown/Enter key handling on the trigger) to the Base UI-backed
 * `DropdownMenu`. Base UI now owns trigger→menu focus, ArrowDown-to-open, the
 * roving item list, Escape, and outside-click — the bespoke keyboard handler
 * is gone. The trigger keeps the legacy `workspace-btn-primary` class for
 * visual consistency with the report page until that page migrates fully.
 */
export function ExportReportButton({ rows, contracts, label, locale }: ExportReportButtonProps) {
  const copy = WORKSPACE_COPY[locale].exportButton;
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportAsPdf = useCallback(async () => {
    setIsExporting(true);
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
      if (!mountNode) {
        throw new Error("Printable report mount node is missing.");
      }

      root = createRoot(mountNode);
      flushSync(() => {
        root!.render(
          <PrintableAuditReport
            locale={locale}
            rows={rows}
            contracts={contracts}
          />,
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

      cleanupTimer = setTimeout(cleanup, PDF_CLEANUP_TIMEOUT_MS);

      printWindow.onafterprint = cleanup;
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error("Printable PDF export failed:", error);
      if (cleanupTimer !== null) clearTimeout(cleanupTimer);
      root?.unmount();
      printWindow?.close();
    } finally {
      setIsExporting(false);
    }
  }, [contracts, copy.popupBlocked, locale, rows]);

  const exportAsCsv = useCallback(() => {
    setIsExporting(true);
    let objectUrl: string | null = null;

    try {
      const csvContent = buildReportCsv(rows, locale);
      const metadata = buildCsvMetadataHeader(locale, rows.length);
      const fullCsv = metadata + "\n\n" + csvContent;
      const blob = new Blob([`\uFEFF${fullCsv}`], { type: "text/csv;charset=utf-8;" });
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
    } finally {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setIsExporting(false);
    }
  }, [locale, rows]);

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="workspace-btn-primary px-3 py-1.5 text-xs font-medium"
              disabled={isExporting}
              aria-label={label}
            />
          }
        >
          {isExporting ? (
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw size={12} strokeWidth={2} className="animate-spin" />
              {copy.exporting}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <FileText size={14} strokeWidth={1.5} />
              {label}
              <ChevronDown size={12} strokeWidth={2} />
            </span>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuItem onClick={() => void exportAsPdf()}>
            {copy.pdf}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportAsCsv()}>
            {copy.csv}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {exportError ? (
        <p className="absolute right-0 top-full mt-1 whitespace-nowrap text-[10px] text-[var(--warning)]" role="alert">
          {exportError}
        </p>
      ) : null}
    </div>
  );
}
