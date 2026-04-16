import { describe, expect, it } from "vitest";

import { PARTICLE_COUNT } from "./particle-field";

describe("particle field config", () => {
  it("uses a denser particle field for the landing hero", () => {
    expect(PARTICLE_COUNT).toBe(4000);
  });
});
