import { describe, expect, it } from "vitest";

import { isOutsideDismissibleLayer } from "./use-dismissible-layer";

describe("isOutsideDismissibleLayer", () => {
  it("treats missing roots and targets as outside", () => {
    const target = {} as EventTarget;
    const root = {
      contains: () => true,
    } as Pick<HTMLElement, "contains">;

    expect(isOutsideDismissibleLayer(null, target)).toBe(true);
    expect(isOutsideDismissibleLayer(root, null)).toBe(true);
  });

  it("detects whether a target belongs to the layer root", () => {
    const child = {} as EventTarget;
    const outside = {} as EventTarget;
    const root = {
      contains: (target: Node | null) => target === child,
    } as Pick<HTMLElement, "contains">;

    expect(isOutsideDismissibleLayer(root, child)).toBe(false);
    expect(isOutsideDismissibleLayer(root, outside)).toBe(true);
  });
});
