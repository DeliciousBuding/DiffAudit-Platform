import { describe, expect, it } from "vitest";

import { sanitizeRuntimeText } from "./runtime-text";

describe("sanitizeRuntimeText", () => {
  it("redacts local paths, URLs, and token-like fields", () => {
    const windowsPath = ["Q:", "runtime", "secret", "run.log"].join("\\");
    const unixPath = ["", "srv", "runtime", "app"].join("/");
    const privateUrl = ["https://", "private.example", "/run"].join("");

    expect(
      sanitizeRuntimeText(
        `failed at ${windowsPath} and ${unixPath} with token=abc123 via ${privateUrl}`,
      ),
    ).toBe("failed at <local-path> and <local-path> with token=<redacted> via <runtime-url>");
  });

  it("preserves empty values", () => {
    expect(sanitizeRuntimeText(null)).toBeNull();
    expect(sanitizeRuntimeText("")).toBe("");
  });
});
