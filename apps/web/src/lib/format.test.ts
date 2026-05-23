import { describe, it, expect } from "vitest";
import {
  formatCompactTime,
  formatFullTime,
  formatDateOnly,
  formatDuration,
  formatMetricValue,
} from "./format";

describe("formatCompactTime", () => {
  it("formats an ISO string for en-US", () => {
    const result = formatCompactTime("2026-04-15T14:30:00Z", "en-US");
    expect(result).toContain("04");
    expect(result).toContain("15");
  });

  it("formats an ISO string for zh-CN", () => {
    const result = formatCompactTime("2026-04-15T14:30:00Z", "zh-CN");
    expect(result).toContain("04");
    expect(result).toContain("15");
  });

  it("returns 'Invalid Date' for unparseable input", () => {
    expect(formatCompactTime("not-a-date", "en-US")).toBe("Invalid Date");
  });
});

describe("formatFullTime", () => {
  it("formats with year for en-US", () => {
    const result = formatFullTime("2026-04-15T14:30:00Z", "en-US");
    expect(result).toContain("2026");
  });

  it("returns 'Invalid Date' for parse error", () => {
    expect(formatFullTime("bad", "en-US")).toBe("Invalid Date");
  });
});

describe("formatDateOnly", () => {
  it("formats a date string for en-US", () => {
    const result = formatDateOnly("2026-04-15", "en-US");
    expect(result.length).toBeGreaterThan(0);
  });

  it("formats a date string for zh-CN", () => {
    const result = formatDateOnly("2026-04-15", "zh-CN");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns 'Invalid Date' for empty string", () => {
    expect(formatDateOnly("", "en-US")).toBe("Invalid Date");
  });
});

describe("formatDuration", () => {
  it("formats seconds in English", () => {
    const now = "2026-04-15T14:30:00Z";
    const later = "2026-04-15T14:30:30Z";
    expect(formatDuration(now, later, "en-US")).toBe("30s");
  });

  it("formats seconds in Chinese", () => {
    const now = "2026-04-15T14:30:00Z";
    const later = "2026-04-15T14:30:30Z";
    expect(formatDuration(now, later, "zh-CN")).toBe("30秒");
  });

  it("formats minutes/seconds in English", () => {
    const now = "2026-04-15T14:30:00Z";
    const later = "2026-04-15T14:32:15Z";
    const result = formatDuration(now, later, "en-US");
    expect(result).toMatch(/^2m \d+s$/);
  });

  it("formats hours/minutes in English", () => {
    const now = "2026-04-15T14:00:00Z";
    const later = "2026-04-15T17:15:00Z";
    const result = formatDuration(now, later, "en-US");
    expect(result).toMatch(/^3h \d+m$/);
  });

  it("formats hours/minutes in Chinese", () => {
    const now = "2026-04-15T14:00:00Z";
    const later = "2026-04-15T17:15:00Z";
    const result = formatDuration(now, later, "zh-CN");
    expect(result).toMatch(/^3时\d+分$/);
  });

  it("uses current time when updated is null", () => {
    const created = new Date(Date.now() - 5000).toISOString();
    const result = formatDuration(created, null, "en-US");
    expect(result).toContain("s");
  });
});

describe("formatMetricValue", () => {
  it("formats a number to 3 decimal places by default", () => {
    expect(formatMetricValue(0.710319)).toBe("0.710");
  });

  it("returns -- for undefined", () => {
    expect(formatMetricValue(undefined)).toBe("--");
  });

  it("respects custom digit count", () => {
    expect(formatMetricValue(0.710319, 5)).toBe("0.71032");
  });

  it("handles zero", () => {
    expect(formatMetricValue(0)).toBe("0.000");
  });

  it("handles one", () => {
    expect(formatMetricValue(1)).toBe("1.000");
  });
});
