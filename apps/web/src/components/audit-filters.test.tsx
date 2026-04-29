import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AuditFilters } from "./audit-filters";

describe("AuditFilters accessibility", () => {
  it("names the filter toolbar and controls in English", () => {
    const markup = renderToStaticMarkup(<AuditFilters locale="en-US" />);

    expect(markup).toContain('role="search"');
    expect(markup).toContain('aria-label="Audit filters"');
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Filter by task status"');
    expect(markup).toContain('aria-label="Filter by audit track"');
    expect(markup).toContain('aria-label="Search audit contracts and jobs"');
    expect(markup).toContain('aria-pressed="true"');
  });

  it("names the filter toolbar and controls in Chinese", () => {
    const markup = renderToStaticMarkup(<AuditFilters locale="zh-CN" />);

    expect(markup).toContain('aria-label="审计筛选"');
    expect(markup).toContain('aria-label="按任务状态筛选"');
    expect(markup).toContain('aria-label="按审计轨道筛选"');
    expect(markup).toContain('aria-label="搜索审计合约和任务"');
  });
});
