/**
 * Shared utilities for PDF and CSV report export.
 * Eliminates duplication between ExportReportButton and ReportExportButtons.
 */

/** Timeout (ms) after which the print window is force-closed if onafterprint never fires. */
export const PDF_CLEANUP_TIMEOUT_MS = 60_000;

/**
 * Wait for the print window to be fully ready (fonts loaded, layout settled).
 */
export async function waitForPrintableWindow(printWindow: Window): Promise<void> {
  if ("fonts" in printWindow.document) {
    await printWindow.document.fonts.ready.catch(() => undefined);
  }
  await new Promise<void>((resolve) => {
    printWindow.requestAnimationFrame(() => {
      printWindow.setTimeout(() => resolve(), 320);
    });
  });
}

/**
 * Build the HTML template for the PDF print window.
 */
export function buildPrintHtmlTemplate(locale: string): string {
  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <title>DiffAudit Report</title>
    <style>
      html, body { margin: 0; padding: 0; background: #dfe5ec; }
      body { min-height: 100vh; }
      #print-root { display: grid; justify-content: center; gap: 18px; padding: 24px 0 40px; }
      @page { size: A4; margin: 0; }
      @media print {
        html, body { background: #ffffff; }
        #print-root { display: block; padding: 0; }
        [data-print-page] { page-break-after: always; break-after: page; }
        [data-print-page]:last-child { page-break-after: auto; break-after: auto; }
      }
    </style>
  </head>
  <body><div id="print-root"></div></body>
</html>`;
}

/**
 * Build CSV metadata header rows with report generation info.
 */
export function buildCsvMetadataHeader(locale: string, rowCount: number): string {
  const isZh = locale === "zh-CN";
  const date = new Date().toISOString().slice(0, 10);
  const reportLabel = isZh ? "报告" : "Report";
  const titleLabel = isZh ? "DiffAudit 隐私审计报告" : "DiffAudit Privacy Audit Report";
  const dateLabel = isZh ? "生成日期" : "Generated";
  const countLabel = isZh ? "结果总数" : "Total rows";

  return [
    `"${reportLabel}","${titleLabel}"`,
    `"${dateLabel}","${date}"`,
    `"${countLabel}","${rowCount}"`,
  ].join("\n");
}
