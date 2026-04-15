"use client";

import { useState, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import { generateReportHTML, type ReportExportRow } from "@/lib/risk-report";
import { generateCompetitionReportHTML } from "@/lib/competition-report";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { type Locale } from "@/components/language-picker";

interface ExportReportButtonProps {
  rows: ReportExportRow[];
  label: string;
  locale: Locale;
  catalogSize?: number;
  defendedRows?: number;
}

export function ExportReportButton({ rows, label, locale, catalogSize = 0, defendedRows = 0 }: ExportReportButtonProps) {
  const copy = WORKSPACE_COPY[locale].exportButton;
  const [isExporting, setIsExporting] = useState(false);

  const exportAsPdf = useCallback(async () => {
    setIsExporting(true);

    try {
      const reportEl = document.querySelector("main") || document.body;
      const canvas = await html2canvas(reportEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1024,
      });

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

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      pdf.save(`DiffAudit-Report-${dateStr}.pdf`);
    } catch (err) {
      // Fallback to HTML export if PDF generation fails
      const html = generateReportHTML(rows, locale);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `DiffAudit-Report-${Date.now()}.html`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [rows, locale]);

  const exportCompetition = useCallback(async () => {
    setIsExporting(true);
    let tempDiv: HTMLDivElement | null = null;

    try {
      const html = generateCompetitionReportHTML({
        rows,
        catalogSize,
        defendedRows,
        locale,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.width = "900px";
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 900,
      });

      document.body.removeChild(tempDiv);
      tempDiv = null;

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297;
      const imgData = canvas.toDataURL("image/png");

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

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      pdf.save(`DiffAudit-Competition-${dateStr}.pdf`);
    } catch (err) {
      // Fallback to HTML export if PDF generation fails
      if (tempDiv && document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
      // Fallback to HTML
      const html = generateCompetitionReportHTML({ rows, catalogSize, defendedRows, locale });
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `DiffAudit-Competition-${Date.now()}.html`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [rows, locale, catalogSize, defendedRows]);

  return (
    <div className="flex items-center gap-2">
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
      <button
        type="button"
        className="portal-pill-sm border border-[color:var(--accent-blue)] text-[color:var(--accent-blue)] hover:bg-[color:var(--accent-blue)]/5"
        onClick={exportCompetition}
        disabled={isExporting}
        title={copy.competitionTitle}
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
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            {copy.competition}
          </span>
        )}
      </button>
    </div>
  );
}
