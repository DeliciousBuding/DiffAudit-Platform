import { describe, expect, it, vi } from "vitest";

import { PARTICLE_COUNT, syncParticleCanvasSize } from "./particle-field";

describe("particle field config", () => {
  it("uses a denser particle field for the landing hero", () => {
    expect(PARTICLE_COUNT).toBe(4000);
  });

  it("resets canvas sizing and transform for the current dpr", () => {
    const setTransform = vi.fn();
    const canvas = {
      width: 0,
      height: 0,
      style: { width: "", height: "" },
      getContext: () => ({ setTransform }),
    };
    const container = {
      getBoundingClientRect: () => ({ width: 1440.4, height: 810.2 }),
    };

    const metrics = syncParticleCanvasSize(canvas, container, 2);

    expect(metrics).toEqual({ width: 1440, height: 810, dpr: 2 });
    expect(canvas.width).toBe(2880);
    expect(canvas.height).toBe(1620);
    expect(canvas.style.width).toBe("1440px");
    expect(canvas.style.height).toBe("810px");
    expect(setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
  });
});
