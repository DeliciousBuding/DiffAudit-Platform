"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";

import type { CatalogEntryViewModel } from "@/lib/catalog";
import type { AttackDefenseRowViewModel } from "@/lib/attack-defense-table";
import { PrintableAuditReport } from "@/components/printable-audit-report";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { type Locale } from "@/components/language-picker";

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

async function waitForPrintableWindow(printWindow: Window) {
  if ("fonts" in printWindow.document) {
    await printWindow.document.fonts.ready.catch(() => undefined);
  }

  await new Promise<void>((resolve) => {
    printWindow.requestAnimationFrame(() => {
      printWindow.setTimeout(() => resolve(), 320);
    });
  });
}

export function ExportReportButton({ rows, contracts, label, locale }: ExportReportButtonProps) {
  const copy = WORKSPACE_COPY[locale].exportButton;
  const [isExporting, setIsExporting] = useState(false);
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

    let printWindow: Window | null = null;
    let root: ReturnType<typeof createRoot> | null = null;

    try {
      printWindow = window.open("", "_blank", "width=1120,height=900");
      if (!printWindow) {
        throw new Error("Print window could not be opened.");
      }

      printWindow.document.open();
      printWindow.document.write(`<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <title>DiffAudit Report</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #dfe5ec;
      }
      body {
        min-height: 100vh;
      }
      #print-root {
        display: grid;
        justify-content: center;
        gap: 18px;
        padding: 24px 0 40px;
      }
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        html, body {
          background: #ffffff;
        }
        #print-root {
          display: block;
          padding: 0;
        }
        [data-print-page] {
          page-break-after: always;
          break-after: page;
        }
        [data-print-page]:last-child {
          page-break-after: auto;
          break-after: auto;
        }
      }
    </style>
  </head>
  <body>
    <div id="print-root"></div>
  </body>
</html>`);
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
        root?.unmount();
        root = null;
        printWindow?.close();
        printWindow = null;
      };

      printWindow.onafterprint = cleanup;
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error("Printable PDF export failed:", error);
      root?.unmount();
      printWindow?.close();
    } finally {
      setIsExporting(false);
    }
  }, [contracts, locale, rows]);

  const exportAsCsv = useCallback(() => {
    setIsExporting(true);
    let objectUrl: string | null = null;

    try {
      const csvContent = buildReportCsv(rows, locale);
      const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
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
            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {copy.exporting}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            {label}
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
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
    </div>
  );
}
