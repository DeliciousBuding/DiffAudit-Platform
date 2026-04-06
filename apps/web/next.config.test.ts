import path from "node:path";

import { describe, expect, it } from "vitest";

import nextConfig from "./next.config";

describe("next config", () => {
  it("pins turbopack root to the workspace root that owns node_modules", () => {
    expect(nextConfig.turbopack?.root).toBe(path.resolve(__dirname, "../.."));
  });
});
