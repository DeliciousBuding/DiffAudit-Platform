"use client";

import { useCallback, useState } from "react";
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

  return (
    <button
      type="button"
      className="workspace-btn-primary px-3 py-1.5 text-xs font-medium"
      onClick={exportAsPdf}
      disabled={isExporting}
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
        </span>
      )}
    </button>
  );
}
