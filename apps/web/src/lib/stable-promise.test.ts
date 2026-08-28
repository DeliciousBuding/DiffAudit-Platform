import { afterEach, describe, expect, it } from "vitest";

import { clearStableLoadCache, stableLoad } from "./stable-promise";

describe("stableLoad", () => {
  afterEach(() => {
    clearStableLoadCache();
  });

  it("returns the same promise for the same key", () => {
    const first = stableLoad("same", async () => 1);
    const second = stableLoad("same", async () => 2);
    expect(first).toBe(second);
  });

  it("keeps distinct keys apart", async () => {
    const first = stableLoad("a", async () => "a");
    const second = stableLoad("b", async () => "b");
    expect(await first).toBe("a");
    expect(await second).toBe("b");
  });

  it("evicts failed loads so the next call retries", async () => {
    let attempts = 0;
    const first = stableLoad("retry", async () => {
      attempts += 1;
      throw new Error("boom");
    });
    await expect(first).rejects.toThrow("boom");

    const second = stableLoad("retry", async () => {
      attempts += 1;
      return "ok";
    });
    await expect(second).resolves.toBe("ok");
    expect(attempts).toBe(2);
  });
});
