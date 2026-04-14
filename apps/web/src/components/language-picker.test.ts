import { describe, expect, it } from "vitest";

import { resolveActiveLocale } from "./language-picker";

describe("resolveActiveLocale", () => {
  it("prefers the pending locale over a stale controlled value", () => {
    expect(
      resolveActiveLocale({
        value: "en-US",
        internalLocale: "en-US",
        pendingLocale: "zh-CN",
      }),
    ).toBe("zh-CN");
  });

  it("falls back to the controlled value when no pending locale exists", () => {
    expect(
      resolveActiveLocale({
        value: "zh-CN",
        internalLocale: "en-US",
        pendingLocale: null,
      }),
    ).toBe("zh-CN");
  });

  it("falls back to internal state for uncontrolled usage", () => {
    expect(
      resolveActiveLocale({
        internalLocale: "zh-CN",
      }),
    ).toBe("zh-CN");
  });
});
