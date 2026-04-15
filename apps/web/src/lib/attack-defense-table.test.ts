import { describe, expect, it } from "vitest";

import {
  summarizeAttackDefenseTable,
  type AttackDefenseRowPayload,
} from "./attack-defense-table";

describe("attack-defense table helpers", () => {
  it("summarizes admitted rows for dashboard consumption", () => {
    const rows: AttackDefenseRowPayload[] = [
      {
        track: "black-box",
        attack: "recon DDIM public-100 step30",
        defense: "none",
        model: "Stable Diffusion v1.5 + DDIM",
        auc: 0.849,
        asr: 0.51,
        tpr_at_1pct_fpr: 1.0,
        quality_cost: "100 public samples per split",
        evidence_level: "runtime-mainline",
        note: "current black-box main evidence",
      },
      {
        track: "gray-box",
        attack: "PIA GPU512 baseline",
        defense: "provisional G-1 = stochastic-dropout",
        model: "CIFAR-10 DDPM",
        auc: 0.82938,
        asr: 0.769531,
        tpr_at_1pct_fpr: 0.023438,
        quality_cost: "512 samples per split",
        evidence_level: "runtime-mainline",
        note: "current gray-box defended main result",
      },
    ];

    expect(summarizeAttackDefenseTable(rows)).toEqual({
      stats: {
        total: 2,
        defended: 1,
        undefended: 1,
      },
      rows: [
        {
          track: "black-box",
          attack: "recon DDIM public-100 step30",
          defense: "none",
          model: "Stable Diffusion v1.5 + DDIM",
          aucLabel: "0.849",
          asrLabel: "0.510",
          tprLabel: "1.000",
          qualityCost: "100 public samples per split",
          evidenceLevel: "runtime-mainline",
          note: "current black-box main evidence",
          riskLevel: "medium",
        },
        {
          track: "gray-box",
          attack: "PIA GPU512 baseline",
          defense: "provisional G-1 = stochastic-dropout",
          model: "CIFAR-10 DDPM",
          aucLabel: "0.829",
          asrLabel: "0.770",
          tprLabel: "0.023",
          qualityCost: "512 samples per split",
          evidenceLevel: "runtime-mainline",
          note: "current gray-box defended main result",
          riskLevel: "medium",
        },
      ],
    });
  });

  it("skips malformed rows so the dashboard stays renderable", () => {
    expect(
      summarizeAttackDefenseTable([
        {
          track: "white-box",
          attack: "GSA 1k-3shadow",
          defense: "W-1 strong-v3 full-scale",
        },
        {
          track: "gray-box",
          attack: null,
          defense: "none",
        } as unknown as AttackDefenseRowPayload,
      ]),
    ).toEqual({
      stats: {
        total: 1,
        defended: 1,
        undefended: 0,
      },
      rows: [
        {
          track: "white-box",
          attack: "GSA 1k-3shadow",
          defense: "W-1 strong-v3 full-scale",
          model: "unknown model",
          aucLabel: "n/a",
          asrLabel: "n/a",
          tprLabel: "n/a",
          qualityCost: "No cost information provided.",
          evidenceLevel: "unknown",
          note: "No additional notes.",
          riskLevel: "low",
        },
      ],
    });
  });
});
