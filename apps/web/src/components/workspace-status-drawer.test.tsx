import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WorkspaceStatusDrawer } from "./workspace-status-drawer";

describe("WorkspaceStatusDrawer", () => {
  it("renders a localized shell status trigger", () => {
    const markup = renderToStaticMarkup(<WorkspaceStatusDrawer locale="zh-CN" dataMode="demo" />);

    expect(markup).toContain("工作台状态");
    expect(markup).toContain('aria-haspopup="dialog"');
  });

  it("uses the existing workspace status styling hook", () => {
    const markup = renderToStaticMarkup(<WorkspaceStatusDrawer locale="en-US" dataMode="live" />);

    expect(markup).toContain("workspace-status-trigger");
    expect(markup).toContain("Workspace status");
  });
});
