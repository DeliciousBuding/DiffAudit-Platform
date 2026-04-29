import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { TabPanel, Tabs } from "./tabs";

describe("Tabs", () => {
  it("links tabs and panels with matching ids", () => {
    const markup = renderToStaticMarkup(
      <>
        <Tabs
          idPrefix="report-tabs"
          value="results"
          onChange={vi.fn()}
          tabs={[
            { value: "results", label: "Results" },
            { value: "compare", label: "Compare" },
          ]}
        />
        <TabPanel idPrefix="report-tabs" value="results" activeValue="results">
          Results content
        </TabPanel>
      </>,
    );

    expect(markup).toContain('id="report-tabs-results"');
    expect(markup).toContain('aria-controls="report-tabs-panel-results"');
    expect(markup).toContain('id="report-tabs-panel-results"');
    expect(markup).toContain('aria-labelledby="report-tabs-results"');
  });

  it("keeps tab ids distinct when callers provide distinct prefixes", () => {
    const markup = renderToStaticMarkup(
      <>
        <Tabs idPrefix="workspace-tabs" value="overview" onChange={vi.fn()} tabs={[{ value: "overview", label: "Overview" }]} />
        <Tabs idPrefix="report-tabs" value="overview" onChange={vi.fn()} tabs={[{ value: "overview", label: "Overview" }]} />
      </>,
    );

    const ids = Array.from(markup.matchAll(/id="([^"]+-overview)"/g), (match) => match[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
});
