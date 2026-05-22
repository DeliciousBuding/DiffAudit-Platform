import { describe, expect, it } from "vitest";

import {
  buildRiskQueryString,
  normalizePage,
  normalizeSeverity,
  parseRiskQuery,
} from "./risk-findings-query";

describe("risk findings query state", () => {
  it("parses valid URL parameters into filter state", () => {
    const query = parseRiskQuery(
      new URLSearchParams(
        "severity=high&category=black-box&model=stable-diffusion&status=investigating&q=portrait&page=3",
      ),
    );

    expect(query).toEqual({
      severityFilter: "high",
      categoryFilter: "black-box",
      modelFilter: "stable-diffusion",
      statusFilter: "investigating",
      searchQuery: "portrait",
      page: 3,
    });
  });

  it("normalizes unsupported severity and invalid page values", () => {
    expect(normalizeSeverity("critical")).toBe("");
    expect(normalizePage("0")).toBe(1);
    expect(normalizePage("-4")).toBe(1);
    expect(normalizePage("2.8")).toBe(2);
    expect(normalizePage("not-a-number")).toBe(1);
  });

  it("serializes only active filters and keeps page one implicit", () => {
    expect(
      buildRiskQueryString({
        severityFilter: "medium",
        categoryFilter: "",
        modelFilter: "photo-real-xl",
        statusFilter: "",
        searchQuery: "  gradient leak  ",
        page: 1,
      }),
    ).toBe("severity=medium&model=photo-real-xl&q=gradient+leak");
  });

  it("serializes pagination only when it changes from the default page", () => {
    expect(
      buildRiskQueryString({
        severityFilter: "",
        categoryFilter: "",
        modelFilter: "",
        statusFilter: "has-defense",
        searchQuery: "",
        page: 4,
      }),
    ).toBe("status=has-defense&page=4");
  });
});
