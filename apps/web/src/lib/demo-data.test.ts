import { describe, expect, it } from "vitest";

import { createMockAuditResult, formatBytes } from "./demo-data";

describe("demo data helpers", () => {
  it("creates a member-like audit result with elevated risk", () => {
    const result = createMockAuditResult(true, {
      rng: () => 0.9,
      fileName: "portrait.png",
      model: "Stable Diffusion 1.5",
      distanceFunction: "SSIM",
      diffusionStep: 200,
      averageN: 10,
    });

    expect(result.isMember).toBe(true);
    expect(result.verdictText).toContain("训练集成员");
    expect(result.riskLevel).toBe("高风险");
    expect(result.confidence).toBeGreaterThan(0.62);
    expect(result.distance).toBeGreaterThan(0.018);
  });

  it("creates a non-member-like audit result with low risk", () => {
    const result = createMockAuditResult(false, {
      rng: () => 0.25,
      fileName: "landscape.jpg",
      model: "Stable Diffusion XL",
      distanceFunction: "LPIPS",
      diffusionStep: 300,
      averageN: 8,
    });

    expect(result.isMember).toBe(false);
    expect(result.verdictText).toContain("非训练集成员");
    expect(result.riskLevel).toBe("低风险");
    expect(result.ssim).toBeGreaterThan(0.52);
    expect(result.threshold).toBe(0.05);
  });

  it("formats file sizes into readable values", () => {
    expect(formatBytes(768)).toBe("768 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});
