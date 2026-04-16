"use client";

import { useState, useCallback, type ReactNode } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { createRoot } from "react-dom/client";

import { generateReportHTML } from "@/lib/risk-report";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { type Locale } from "@/components/language-picker";
import type { AttackDefenseRowViewModel } from "@/lib/attack-defense-table";
import { PrintableAuditReport } from "@/components/printable-audit-report";
import type { CatalogEntryViewModel } from "@/lib/catalog";

interface ExportReportButtonProps {
  rows: AttackDefenseRowViewModel[];
  label: string;
  locale: Locale;
  catalogSize?: number;
  defendedRows?: number;
  contracts?: CatalogEntryViewModel[];
}

function saveCanvasAsA4Pdf(canvas: HTMLCanvasElement, filenamePrefix: string) {
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const pageHeight = 297;
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  pdf.save(`${filenamePrefix}-${dateStr}.pdf`);
}

async function renderHtmlToCanvas(html: string) {
  let tempDiv: HTMLDivElement | null = document.createElement("div");
  tempDiv.innerHTML = html;
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "0";
  tempDiv.style.width = "794px";
  document.body.appendChild(tempDiv);

  try {
    return await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });
  } finally {
    if (tempDiv && document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
    tempDiv = null;
  }
}

async function exportHtmlAsPdf(html: string, filenamePrefix: string) {
  const canvas = await renderHtmlToCanvas(html);
  saveCanvasAsA4Pdf(canvas, filenamePrefix);
}

async function exportElementAsPdf(element: ReactNode, filenamePrefix: string) {
  let tempDiv: HTMLDivElement | null = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "0";
  tempDiv.style.width = "794px";
  document.body.appendChild(tempDiv);

  const root = createRoot(tempDiv);

  try {
    root.render(element);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });
    saveCanvasAsA4Pdf(canvas, filenamePrefix);
  } finally {
    root.unmount();
    if (tempDiv && document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
    tempDiv = null;
  }
}

export function ExportReportButton({
  rows,
  label,
  locale,
  contracts = [],
}: ExportReportButtonProps) {
  const copy = WORKSPACE_COPY[locale].exportButton;
  const [isExporting, setIsExporting] = useState(false);

  const exportAsPdf = useCallback(async () => {
    setIsExporting(true);

    try {
      await exportElementAsPdf(
        <PrintableAuditReport locale={locale} rows={rows} contracts={contracts} />,
        "DiffAudit-Report",
      );
    } catch {
      const fallbackHtml = generateReportHTML(rows, locale);
      await exportHtmlAsPdf(fallbackHtml, "DiffAudit-Report");
    } finally {
      setIsExporting(false);
    }
  }, [rows, locale, contracts]);

  return (
    <div className="flex items-center">
      <button
        type="button"
        className="portal-pill-sm portal-pill-sm-primary"
        onClick={exportAsPdf}
        disabled={isExporting}
      >
        {isExporting ? (
          <span className="inline-flex items-center gap-1.5">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {copy.exporting}
          </span>
        ) : (
          label
        )}
      </button>
    </div>
  );
}
