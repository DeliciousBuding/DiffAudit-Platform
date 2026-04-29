import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/button";

const GLOBAL_CSS = path.join(process.cwd(), "src", "app", "globals.css");
const DESIGN_DOC = path.join(process.cwd(), "DESIGN.md");
const MAX_LEGACY_BUTTON_NOT_SELECTORS = 12;

describe("ui primitive guardrails", () => {
  it("marks Button instances so legacy broad selectors do not own primitive behavior", () => {
    const markup = renderToStaticMarkup(<Button>Run audit</Button>);

    expect(markup).toContain("ui-button");
  });

  it("prevents broad global button selectors from expanding", () => {
    const css = readFileSync(GLOBAL_CSS, "utf8");
    const occurrences = css.match(/button:not\(/g) ?? [];

    expect(occurrences.length).toBeLessThanOrEqual(MAX_LEGACY_BUTTON_NOT_SELECTORS);
    expect(css).toContain("Do not extend; prefer Button or local classes.");
    expect(css).toContain(":not(.ui-button)");
  });

  it("documents primitive ownership in the design contract", () => {
    const design = readFileSync(DESIGN_DOC, "utf8");

    expect(design).toContain("UI Primitive Ownership");
    expect(design).toContain("`WorkspacePageFrame`");
    expect(design).toContain("`WorkspaceSectionCard`");
  });
});
