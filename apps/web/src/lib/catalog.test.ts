import { describe, expect, it } from "vitest";

import { summarizeCatalogEntries, type CatalogEntryPayload } from "./catalog";

const catalogEntries: CatalogEntryPayload[] = [
  {
    contract_key: "black-box/recon/sd15-ddim",
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
    system_gap: "surface semantic limits cleanly",
  },
  {
    contract_key: "gray-box/pia/cifar10-ddpm",
    track: "gray-box",
    attack_family: "pia",
    target_key: "cifar10-ddpm",
    label: "PIA Runtime Mainline",
    paper: "PIA",
    availability: "ready",
    evidence_level: "best-summary",
    backend: null,
    scheduler: null,
    best_summary_path: "D:/summary/pia.json",
    best_workspace: "pia-cifar10-runtime-mainline-20260407-cpu",
    system_gap: "expose cost columns consistently",
  },
  {
    contract_key: "white-box/gsa/ddpm-cifar10",
    track: "white-box",
    attack_family: "gsa",
    target_key: "ddpm-cifar10",
    label: "GSA Runtime Mainline",
    paper: "GSA",
    availability: "partial",
    evidence_level: "best-summary",
    backend: null,
    scheduler: null,
    best_summary_path: "D:/summary/gsa.json",
    best_workspace: "gsa-runtime-mainline-20260407-cpu",
    system_gap: "expose defended W-1 beside GSA",
  },
];

describe("catalog helpers", () => {
  it("summarizes unified contract counts and grouped track state for the dashboard", () => {
    expect(summarizeCatalogEntries(catalogEntries)).toEqual({
      stats: {
        total: 3,
        ready: 2,
        partial: 1,
        planned: 0,
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
              contractKey: "black-box/recon/sd15-ddim",
              label: "Stable Diffusion 1.5 DDIM Recon",
              track: "black-box",
              availability: "ready",
              evidenceLevel: "best-summary",
              capabilityLabel: "recon / sd15-ddim",
              paper: "BlackBox_Reconstruction_ArXiv2023",
              runtimeLabel: "stable_diffusion / ddim",
              bestWorkspace: "recon-runtime-mainline-ddim-public-100-step30",
              bestSummaryPath: "D:/summary/recon.json",
              systemGap: "surface semantic limits cleanly",
            },
          ],
        },
        {
          track: "gray-box",
          total: 1,
          ready: 1,
          partial: 0,
          planned: 0,
          entries: [
            {
              contractKey: "gray-box/pia/cifar10-ddpm",
              label: "PIA Runtime Mainline",
              track: "gray-box",
              availability: "ready",
              evidenceLevel: "best-summary",
              capabilityLabel: "pia / cifar10-ddpm",
              paper: "PIA",
              runtimeLabel: "unassigned backend",
              bestWorkspace: "pia-cifar10-runtime-mainline-20260407-cpu",
              bestSummaryPath: "D:/summary/pia.json",
              systemGap: "expose cost columns consistently",
            },
          ],
        },
        {
          track: "white-box",
          total: 1,
          ready: 0,
          partial: 1,
          planned: 0,
          entries: [
            {
              contractKey: "white-box/gsa/ddpm-cifar10",
              label: "GSA Runtime Mainline",
              track: "white-box",
              availability: "partial",
              evidenceLevel: "best-summary",
              capabilityLabel: "gsa / ddpm-cifar10",
              paper: "GSA",
              runtimeLabel: "unassigned backend",
              bestWorkspace: "gsa-runtime-mainline-20260407-cpu",
              bestSummaryPath: "D:/summary/gsa.json",
              systemGap: "expose defended W-1 beside GSA",
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
            contractKey: "black-box/recon/sd15-ddim",
            label: "Stable Diffusion 1.5 DDIM Recon",
            track: "black-box",
            availability: "ready",
            evidenceLevel: "best-summary",
            capabilityLabel: "recon / sd15-ddim",
            paper: "BlackBox_Reconstruction_ArXiv2023",
            runtimeLabel: "stable_diffusion / ddim",
            bestWorkspace: "recon-runtime-mainline-ddim-public-100-step30",
            bestSummaryPath: "D:/summary/recon.json",
            systemGap: "surface semantic limits cleanly",
          },
        ],
      },
      {
        track: "gray-box",
        total: 1,
        ready: 1,
        partial: 0,
        planned: 0,
        entries: [
          {
            contractKey: "gray-box/pia/cifar10-ddpm",
            label: "PIA Runtime Mainline",
            track: "gray-box",
            availability: "ready",
            evidenceLevel: "best-summary",
            capabilityLabel: "pia / cifar10-ddpm",
            paper: "PIA",
            runtimeLabel: "unassigned backend",
            bestWorkspace: "pia-cifar10-runtime-mainline-20260407-cpu",
            bestSummaryPath: "D:/summary/pia.json",
            systemGap: "expose cost columns consistently",
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

  it("skips malformed catalog entries so one bad row does not break the dashboard shell", () => {
    expect(
      summarizeCatalogEntries([
        {
          contract_key: "black-box/recon/sd15-ddim",
          track: "black-box",
          attack_family: "recon",
          target_key: "sd15-ddim",
          label: "Stable Diffusion 1.5 DDIM Recon",
          availability: "ready",
          evidence_level: "best-summary",
          backend: "stable_diffusion",
          scheduler: "ddim",
          best_summary_path: "D:/summary/recon.json",
          best_workspace: "recon-runtime-mainline-ddim-public-100-step30",
          paper: "BlackBox_Reconstruction_ArXiv2023",
          system_gap: "surface semantic limits cleanly",
          extra_field_from_backend: "ignored",
        } as CatalogEntryPayload,
        {
          contract_key: null,
          track: "gray-box",
          availability: "partial",
        } as unknown as CatalogEntryPayload,
      ]),
    ).toEqual({
      stats: {
        total: 1,
        ready: 1,
        partial: 0,
        planned: 0,
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
              contractKey: "black-box/recon/sd15-ddim",
              label: "Stable Diffusion 1.5 DDIM Recon",
              track: "black-box",
              availability: "ready",
              evidenceLevel: "best-summary",
              capabilityLabel: "recon / sd15-ddim",
              paper: "BlackBox_Reconstruction_ArXiv2023",
              runtimeLabel: "stable_diffusion / ddim",
              bestWorkspace: "recon-runtime-mainline-ddim-public-100-step30",
              bestSummaryPath: "D:/summary/recon.json",
              systemGap: "surface semantic limits cleanly",
            },
          ],
        },
        {
          track: "gray-box",
          total: 0,
          ready: 0,
          partial: 0,
          planned: 0,
          entries: [],
        },
        {
          track: "white-box",
          total: 0,
          ready: 0,
          partial: 0,
          planned: 0,
          entries: [],
        },
      ],
    });
  });

  it("accepts contract_key as the primary catalog identity and falls back from the previous key field", () => {
    expect(
      summarizeCatalogEntries([
        {
          contract_key: "gray-box/secmi/sd15-ddim",
          track: "gray-box",
          attack_family: "secmi",
          target_key: "sd15-ddim",
          label: "SecMI Probe",
          availability: "partial",
        } as CatalogEntryPayload,
        {
          key: "white-box/gsa/ddpm-cifar10",
          track: "white-box",
          attack_family: "gsa",
          target_key: "ddpm-cifar10",
          label: "Legacy WhiteBox Entry",
          availability: "planned",
        } as CatalogEntryPayload,
      ]).tracks,
    ).toEqual([
      {
        track: "black-box",
        total: 0,
        ready: 0,
        partial: 0,
        planned: 0,
        entries: [],
      },
      {
        track: "gray-box",
        total: 1,
        ready: 0,
        partial: 1,
        planned: 0,
        entries: [
          {
            contractKey: "gray-box/secmi/sd15-ddim",
            label: "SecMI Probe",
            track: "gray-box",
            availability: "partial",
            evidenceLevel: "catalog",
            capabilityLabel: "secmi / sd15-ddim",
            paper: "unknown",
            runtimeLabel: "unassigned backend",
            bestWorkspace: "pending workspace",
            bestSummaryPath: "pending summary",
            systemGap: "当前没有额外系统缺口说明。",
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
            contractKey: "white-box/gsa/ddpm-cifar10",
            label: "Legacy WhiteBox Entry",
            track: "white-box",
            availability: "planned",
            evidenceLevel: "catalog",
            capabilityLabel: "gsa / ddpm-cifar10",
            paper: "unknown",
            runtimeLabel: "unassigned backend",
            bestWorkspace: "pending workspace",
            bestSummaryPath: "pending summary",
            systemGap: "当前没有额外系统缺口说明。",
          },
        ],
      },
    ]);
  });
});
