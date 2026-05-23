import { describe, it, expect } from "vitest";
import { timingSafeStateEqual } from "./timing-safe";

describe("timingSafeStateEqual", () => {
  it("returns true for identical strings", () => {
    expect(timingSafeStateEqual("abc123", "abc123")).toBe(true);
  });

  it("returns false for different strings of same length", () => {
    expect(timingSafeStateEqual("abc123", "xyz789")).toBe(false);
  });

  it("returns false for different length strings", () => {
    expect(timingSafeStateEqual("short", "longer-string")).toBe(false);
  });

  it("returns false for empty vs non-empty", () => {
    expect(timingSafeStateEqual("", "x")).toBe(false);
  });

  it("returns true for both empty", () => {
    expect(timingSafeStateEqual("", "")).toBe(true);
  });

  it("handles very long strings (>256 chars) gracefully", () => {
    const long = "x".repeat(300);
    expect(timingSafeStateEqual(long, long)).toBe(false); // exceeds MAX_STATE_LENGTH
  });
});
