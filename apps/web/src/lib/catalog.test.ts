import { describe, expect, it } from "vitest";

import { summarizeCatalogEntries, type CatalogEntryPayload } from "./catalog";

const catalogEntries: CatalogEntryPayload[] = [
  {
    key: "black-box/recon/sd15-ddim",
    track: "black-box",
    attack_family: "recon",
    target_key: "sd15-ddim",
    label: "Stable Diffusion 1.5 DDIM Recon",
    paper: "BlackBox_Reconstruction_ArXiv2023",
    availability: "ready",
    evidence_level: "best-summary",
    backend: "stable_diffusion",
    scheduler: "ddim",
    best_summary_path: "D:/summary/recon.json",
    best_workspace: "recon-runtime-mainline-ddim-public-100-step30",
  },
  {
    key: "gray-box/pia/sd15-ddim",
    track: "gray-box",
    attack_family: "pia",
    target_key: "sd15-ddim",
    label: "PIA Smoke",
    paper: "PIA_2024",
    availability: "partial",
    evidence_level: "catalog",
    backend: null,
    scheduler: null,
    best_summary_path: null,
    best_workspace: null,
  },
  {
    key: "white-box/gsa/sd15-ddim",
    track: "white-box",
    attack_family: "gsa",
    target_key: "sd15-ddim",
    label: "GSA Planned",
    paper: "GSA_2024",
    availability: "planned",
    evidence_level: "catalog",
    backend: null,
    scheduler: null,
    best_summary_path: null,
    best_workspace: null,
  },
];

describe("catalog helpers", () => {
  it("summarizes unified contract counts and grouped track state for the dashboard", () => {
    expect(summarizeCatalogEntries(catalogEntries)).toEqual({
      stats: {
        total: 3,
        ready: 1,
        partial: 1,
        planned: 1,
      },
      tracks: [
        {
          track: "black-box",
          total: 1,
          ready: 1,
          partial: 0,
          planned: 0,
          entries: [
            {
              key: "black-box/recon/sd15-ddim",
              label: "Stable Diffusion 1.5 DDIM Recon",
              track: "black-box",
              availability: "ready",
              evidenceLevel: "best-summary",
              capabilityLabel: "recon / sd15-ddim",
              paper: "BlackBox_Reconstruction_ArXiv2023",
              runtimeLabel: "stable_diffusion / ddim",
              bestWorkspace: "recon-runtime-mainline-ddim-public-100-step30",
              bestSummaryPath: "D:/summary/recon.json",
            },
          ],
        },
        {
          track: "gray-box",
          total: 1,
          ready: 0,
          partial: 1,
          planned: 0,
          entries: [
            {
              key: "gray-box/pia/sd15-ddim",
              label: "PIA Smoke",
              track: "gray-box",
              availability: "partial",
              evidenceLevel: "catalog",
              capabilityLabel: "pia / sd15-ddim",
              paper: "PIA_2024",
              runtimeLabel: "unassigned backend",
              bestWorkspace: "pending workspace",
              bestSummaryPath: "pending summary",
            },
          ],
        },
        {
          track: "white-box",
          total: 1,
          ready: 0,
          partial: 0,
          planned: 1,
          entries: [
            {
              key: "white-box/gsa/sd15-ddim",
              label: "GSA Planned",
              track: "white-box",
              availability: "planned",
              evidenceLevel: "catalog",
              capabilityLabel: "gsa / sd15-ddim",
              paper: "GSA_2024",
              runtimeLabel: "unassigned backend",
              bestWorkspace: "pending workspace",
              bestSummaryPath: "pending summary",
            },
          ],
        },
      ],
    });
  });

  it("keeps all three tracks visible even if a track has no catalog entries yet", () => {
    expect(
      summarizeCatalogEntries(
        catalogEntries.filter((entry) => entry.track !== "white-box"),
      ).tracks,
    ).toEqual([
      {
        track: "black-box",
        total: 1,
        ready: 1,
        partial: 0,
        planned: 0,
        entries: [
          {
            key: "black-box/recon/sd15-ddim",
            label: "Stable Diffusion 1.5 DDIM Recon",
            track: "black-box",
            availability: "ready",
            evidenceLevel: "best-summary",
            capabilityLabel: "recon / sd15-ddim",
            paper: "BlackBox_Reconstruction_ArXiv2023",
            runtimeLabel: "stable_diffusion / ddim",
            bestWorkspace: "recon-runtime-mainline-ddim-public-100-step30",
            bestSummaryPath: "D:/summary/recon.json",
          },
        ],
      },
      {
        track: "gray-box",
        total: 1,
        ready: 0,
        partial: 1,
        planned: 0,
        entries: [
          {
            key: "gray-box/pia/sd15-ddim",
            label: "PIA Smoke",
            track: "gray-box",
            availability: "partial",
            evidenceLevel: "catalog",
            capabilityLabel: "pia / sd15-ddim",
            paper: "PIA_2024",
            runtimeLabel: "unassigned backend",
            bestWorkspace: "pending workspace",
            bestSummaryPath: "pending summary",
          },
        ],
      },
      {
        track: "white-box",
        total: 0,
        ready: 0,
        partial: 0,
        planned: 0,
        entries: [],
      },
    ]);
  });
});
