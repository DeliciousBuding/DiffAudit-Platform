import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("surfaces an operator-focused summary and follow-up sections", () => {
    const markup = renderToStaticMarkup(<DashboardPage />);

    expect(markup).toContain("今日重点");
    expect(markup).toContain("建议优先复核");
    expect(markup).toContain("覆盖模型与执行状态");
    expect(markup).toContain("风险分布图例");
  });
});
