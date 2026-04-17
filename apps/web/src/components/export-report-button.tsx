"use client";

import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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

export function ExportReportButton({ rows, contracts, label, locale }: ExportReportButtonProps) {
  const copy = WORKSPACE_COPY[locale].exportButton;
  const [isExporting, setIsExporting] = useState(false);

  const renderPrintableCanvas = useCallback(async () => {
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "-200vw";
    host.style.top = "0";
    host.style.width = "900px";
    host.style.pointerEvents = "none";
    host.style.opacity = "0";
    host.setAttribute("aria-hidden", "true");
    document.body.appendChild(host);

    const root = createRoot(host);

    try {
      flushSync(() => {
        root.render(
          <PrintableAuditReport
            locale={locale}
            rows={rows}
            contracts={contracts}
          />,
        );
      });

      if ("fonts" in document) {
        await document.fonts.ready.catch(() => undefined);
      }

      await new Promise((resolve) => window.setTimeout(resolve, 180));

      const pageEls = Array.from(host.querySelectorAll("[data-print-page]")) as HTMLElement[];
      if (pageEls.length === 0) {
        throw new Error("Printable report did not render.");
      }

      const canvases: HTMLCanvasElement[] = [];
      for (const pageEl of pageEls) {
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 900,
        });
        canvases.push(canvas);
      }

      return canvases;
    } finally {
      root.unmount();
      document.body.removeChild(host);
    }
  }, [contracts, locale, rows]);

  const exportAsPdf = useCallback(async () => {
    setIsExporting(true);

    try {
      const canvases = await renderPrintableCanvas();
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;

      canvases.forEach((canvas, index) => {
        if (index > 0) {
          pdf.addPage();
        }
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      });

      if (canvases.length === 0) {
        throw new Error("Printable report export produced no pages.");
      }

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      pdf.save(`DiffAudit-Report-${dateStr}.pdf`);
    } catch (err) {
      console.error("Printable PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, [renderPrintableCanvas]);

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
