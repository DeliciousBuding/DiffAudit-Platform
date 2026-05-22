import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LogoutButton } from "./logout-button";

describe("LogoutButton", () => {
  it("preserves the default logout button contract while accepting menu semantics", () => {
    const markup = renderToStaticMarkup(
      React.createElement(LogoutButton, {
        label: "Sign out",
        role: "menuitem",
        "aria-label": "Sign out",
        className: "w-full justify-start",
      }),
    );

    expect(markup).toContain('type="button"');
    expect(markup).toContain('role="menuitem"');
    expect(markup).toContain('aria-label="Sign out"');
    expect(markup).toContain("rounded-xl");
    expect(markup).toContain("w-full justify-start");
  });
});
