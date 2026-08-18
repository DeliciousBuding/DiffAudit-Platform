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
  });

  it("generates distinct trigger ids for multiple instances", () => {
    const markup = renderToStaticMarkup(
      <>
        <ExportReportButton rows={[]} contracts={[]} label="Export report" locale="en-US" />
        <ExportReportButton rows={[]} contracts={[]} label="Export report" locale="en-US" />
      </>,
    );

    const ids = Array.from(markup.matchAll(/id="(base-ui-[^"]+)"/g), (match) => match[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
});
