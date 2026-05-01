import { describe, expect, it } from "vitest";

import { buildReportCsv, sanitizeCsvField } from "./export-report-button";

describe("export report csv helpers", () => {
  it("escapes quotes and normalizes newlines", () => {
    expect(sanitizeCsvField('he said "hi"\r\nnext')).toBe('"he said ""hi""\nnext"');
  });

  it("prefixes formula-like content for spreadsheet safety", () => {
    expect(sanitizeCsvField("=SUM(A1:A2)")).toBe('"\'=SUM(A1:A2)"');
    expect(sanitizeCsvField("+risk")).toBe('"\'+risk"');
  });

  it("builds csv rows with escaped data", () => {
    const csv = buildReportCsv([
      {
        track: "gray-box",
        attack: 'PIA "baseline"',
        defense: "none",
        model: "@model",
        aucLabel: "0.841",
        asrLabel: "0.786",
        tprLabel: "0.058",
        evidenceLevel: "runtime-mainline",
        qualityCost: "",
        note: "",
        riskLevel: "high",
      },
    ], "en-US");

    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('"Track"');
    expect(lines[1]).toContain('"PIA ""baseline"""');
    expect(lines[1]).toContain('"\'@model"');
  });

  it("localizes csv headers for zh-CN", () => {
    const csv = buildReportCsv([], "zh-CN");
    const [headerLine] = csv.split("\n");

    expect(headerLine).toContain('"审计线路"');
    expect(headerLine).toContain('"攻击方法"');
    expect(headerLine).toContain('"防御方法"');
    expect(headerLine).toContain('"证据等级"');
  });
});
