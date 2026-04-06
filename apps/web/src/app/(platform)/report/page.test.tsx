import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ReportPage from "./page";

describe("ReportPage", () => {
  it("includes an executive summary and a remediation checklist", () => {
    const markup = renderToStaticMarkup(<ReportPage />);

    expect(markup).toContain("执行摘要");
    expect(markup).toContain("证据链摘要");
    expect(markup).toContain("处置建议清单");
    expect(markup).toContain("需要法务复核");
  });
});
