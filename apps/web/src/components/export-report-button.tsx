"use client";

import { RefreshCw, FileText, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";

import type { CatalogEntryViewModel } from "@/lib/catalog";
import type { AttackDefenseRowViewModel } from "@/lib/attack-defense-table";
import { PrintableAuditReport } from "@/components/printable-audit-report";
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

export function ExportReportButton({ rows, contracts, label, locale }: ExportReportButtonProps) {
  const copy = WORKSPACE_COPY[locale].exportButton;
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuItemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusMenuItem = useCallback((index: number) => {
    menuItemRefs.current[index]?.focus();
  }, []);

  const openMenuAndFocus = useCallback((index: number) => {
    setOpen(true);
    window.requestAnimationFrame(() => focusMenuItem(index));
  }, [focusMenuItem]);

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

      // Timeout cleanup: if onafterprint never fires, force-close
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

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleTriggerKeyDown = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenuAndFocus(0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenuAndFocus(1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenuAndFocus(0);
    }
  }, [openMenuAndFocus]);

  const handleMenuKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    const itemCount = menuItemRefs.current.filter(Boolean).length;
    if (itemCount === 0) {
      return;
    }

    const activeIndex = menuItemRefs.current.findIndex((item) => item === document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusMenuItem((activeIndex + 1 + itemCount) % itemCount);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusMenuItem((activeIndex - 1 + itemCount) % itemCount);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusMenuItem(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusMenuItem(itemCount - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }, [focusMenuItem]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        className="workspace-btn-primary px-3 py-1.5 text-xs font-medium"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        disabled={isExporting}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
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
      </button>

      {open && !isExporting ? (
        <div
          id={menuId}
          className="header-floating-panel absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-2xl p-1.5"
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
        >
          <button
            ref={(node) => {
              menuItemRefs.current[0] = node;
            }}
            type="button"
            className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
            role="menuitem"
            tabIndex={-1}
            onClick={() => {
              setOpen(false);
              void exportAsPdf();
            }}
          >
            {copy.pdf}
          </button>
          <button
            ref={(node) => {
              menuItemRefs.current[1] = node;
            }}
            type="button"
            className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
            role="menuitem"
            tabIndex={-1}
            onClick={() => {
              setOpen(false);
              exportAsCsv();
            }}
          >
            {copy.csv}
          </button>
        </div>
      ) : null}
      {exportError ? (
        <p className="absolute right-0 top-full mt-1 text-[10px] text-[color:var(--warning)] whitespace-nowrap" role="alert">
          {exportError}
        </p>
      ) : null}
    </div>
  );
}
