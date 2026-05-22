import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/button";

const GLOBAL_CSS = path.join(process.cwd(), "src", "app", "globals.css");
const DESIGN_DOC = path.join(process.cwd(), "DESIGN.md");
const MODEL_ASSETS_CLIENT = path.join(
  process.cwd(),
  "src",
  "app",
  "(workspace)",
  "workspace",
  "model-assets",
  "ModelAssetsClient.tsx",
);
const FINDING_DETAIL_PANEL = path.join(
  process.cwd(),
  "src",
  "app",
  "(workspace)",
  "workspace",
  "risk-findings",
  "FindingDetailPanel.tsx",
);
const SETTINGS_CLIENT = path.join(
  process.cwd(),
  "src",
  "app",
  "(workspace)",
  "workspace",
  "settings",
  "SettingsClient.tsx",
);
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

  it("keeps model asset destructive dialogs on the shared Modal primitive", () => {
    const source = readFileSync(MODEL_ASSETS_CLIENT, "utf8");

    expect(source).toContain("<Modal");
    expect(source).toContain("open={showDeleteConfirm}");
    expect(source).not.toContain('document.addEventListener("keydown"');
  });

  it("keeps risk finding slide-over dismissal on the shared dismissible layer", () => {
    const source = readFileSync(FINDING_DETAIL_PANEL, "utf8");

    expect(source).toContain("useDismissibleLayer");
    expect(source).toContain("rootRef: panelRef");
    expect(source).not.toContain('document.addEventListener("keydown"');
  });

  it("keeps settings template deletion on the shared Modal primitive", () => {
    const source = readFileSync(SETTINGS_CLIENT, "utf8");

    expect(source).toContain("<Modal");
    expect(source).toContain("templatePendingDeleteId");
    expect(source).not.toContain("window.confirm");
  });
});
