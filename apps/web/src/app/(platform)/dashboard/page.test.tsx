import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("surfaces an operator-focused summary and follow-up sections", () => {
    const markup = renderToStaticMarkup(<DashboardPage />);

    expect(markup).toContain("执行摘要");
    expect(markup).toContain("高风险样本 6，待复核 2");
    expect(markup).toContain("覆盖模型与执行状态");
    expect(markup).toContain("风险分布图例");
  });
});
