import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ReportAuditView } from "./ReportAuditView";

describe("ReportAuditView", () => {
  it("renders the zh-CN intake manifest label in Chinese", () => {
    const markup = renderToStaticMarkup(
      <ReportAuditView
        locale="zh-CN"
        rows={[]}
        provenance={{}}
        historyPlaceholder="history"
      />,
    );

    expect(markup).toContain("导入清单");
    expect(markup).not.toContain("Intake Manifest");
  });
});
