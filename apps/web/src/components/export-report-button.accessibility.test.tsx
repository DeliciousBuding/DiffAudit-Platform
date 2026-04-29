import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ExportReportButton } from "./export-report-button";

describe("ExportReportButton accessibility", () => {
  it("exposes a menu relationship from the trigger", () => {
    const markup = renderToStaticMarkup(
      <ExportReportButton rows={[]} contracts={[]} label="Export report" locale="en-US" />,
    );

    expect(markup).toContain('aria-haspopup="menu"');
    expect(markup).toMatch(/aria-controls="[^"]+"/);
  });

  it("generates distinct menu ids for multiple triggers", () => {
    const markup = renderToStaticMarkup(
      <>
        <ExportReportButton rows={[]} contracts={[]} label="Export report" locale="en-US" />
        <ExportReportButton rows={[]} contracts={[]} label="Export report" locale="en-US" />
      </>,
    );

    const controls = Array.from(markup.matchAll(/aria-controls="([^"]+)"/g), (match) => match[1]);
    expect(controls).toHaveLength(2);
    expect(new Set(controls).size).toBe(2);
  });
});
