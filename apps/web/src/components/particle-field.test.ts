import { describe, expect, it } from "vitest";

import { MEMBER_COLORS, PARTICLE_COUNT } from "./particle-field";

describe("particle field config", () => {
  it("uses a denser particle field for the landing hero", () => {
    expect(PARTICLE_COUNT).toBe(455);
  });

  it("keeps member colors muted for the audit pulse", () => {
    expect(MEMBER_COLORS).toEqual([
      { r: 119, g: 138, b: 214 },
      { r: 148, g: 129, b: 216 },
      { r: 96, g: 184, b: 124 },
      { r: 214, g: 146, b: 92 },
    ]);
  });
});
