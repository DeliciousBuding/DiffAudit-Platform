import crypto from "node:crypto";

import { DEMO_JOBS, type DemoJobRecord } from "@/lib/demo-snapshot";

type DemoJobDraft = {
  contract_key?: string;
  workspace_name?: string;
  job_type?: string;
  target_model?: string;
};

declare global {
  var __diffauditDemoJobs__: DemoJobRecord[] | undefined;
}

function getStore() {
  if (!globalThis.__diffauditDemoJobs__) {
    const now = new Date();
    const recentIso = new Date(now.getTime() - 6_000).toISOString();
    const alwaysRunning: DemoJobRecord = {
      job_id: "job_demo_live",
      status: "running",
      contract_key: "gsa_runtime_mainline",
      workspace_name: "live-defense-sweep",
      job_type: "gsa_runtime_mainline",
      created_at: recentIso,
      updated_at: now.toISOString(),
      target_model: "stable-diffusion-v1-4",
      summary_note: "White-box GSA sweep is actively running — checking memorization vectors.",
      progress_pct: 42,
      stdout_tail: "[demo] worker allocated\n[demo] sampling posterior slices\n[demo] score separation in progress",
      stderr_tail: "",
      state_history: [
        { state: "queued", timestamp: recentIso },
        { state: "running", timestamp: new Date(now.getTime() - 3_000).toISOString() },
      ],
    };
    globalThis.__diffauditDemoJobs__ = [alwaysRunning, ...DEMO_JOBS];
  }
  return globalThis.__diffauditDemoJobs__;
}

const DEMO_RUNTIME_MS = {
  queued: 3_000,
  running: 12_000,
} as const;

function inferTargetModel(contractKey: string) {
  const normalized = contractKey.toLowerCase();
  if (normalized.includes("photo")) return "photo-real-xl";
  if (normalized.includes("medmnist")) return "medmnist-derma-v3";
  if (normalized.includes("audio")) return "audio-diffusion-s";
  if (normalized.includes("pixel")) return "pixel-art-v2";
  return "stable-diffusion-v1-4";
}

function inferJobType(contractKey: string) {
  const normalized = contractKey.toLowerCase();
  if (normalized.includes("gsa") || normalized.includes("white")) return "gsa_runtime_mainline";
  if (normalized.includes("pia") || normalized.includes("gray")) return "pia_runtime_mainline";
  return "recon_artifact_mainline";
}

function buildDemoMetrics(contractKey: string) {
  const normalized = contractKey.toLowerCase();
  if (normalized.includes("gsa")) {
    return { auc: 0.512, asr: 0.388, tpr: 0.27 };
  }
  if (normalized.includes("pia") || normalized.includes("gray")) {
    return { auc: 0.781, asr: 0.642, tpr: 0.84 };
  }
  return { auc: 0.864, asr: 0.531, tpr: 0.96 };
}

function buildRunningTail(job: DemoJobRecord, elapsedMs: number) {
  const elapsedSec = Math.max(1, Math.floor(elapsedMs / 1000));
  return [
    `[demo] job accepted for ${job.contract_key}`,
    `[demo] workspace ${job.workspace_name} warming up`,
    `[demo] ${elapsedSec}s elapsed — score separation still widening`,
  ].join("\n");
}

function materializeDemoJob(job: DemoJobRecord): DemoJobRecord {
  if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
    return job;
  }

  // Perpetually running demo job — always shows as actively running
  if (job.job_id === "job_demo_live") {
    const now = Date.now();
    const elapsedSec = Math.floor(Math.random() * 120) + 60;
    return {
      ...job,
      status: "running",
      updated_at: new Date(now).toISOString(),
      progress_pct: 35 + Math.floor(Math.random() * 40),
      stdout_tail: buildRunningTail(job, elapsedSec * 1000),
    };
  }

  const createdAt = new Date(job.created_at).getTime();
  const now = Date.now();
  const elapsedMs = Math.max(0, now - createdAt);

  if (elapsedMs < DEMO_RUNTIME_MS.queued) {
    const progressPct = Math.min(24, Math.max(8, Math.floor((elapsedMs / DEMO_RUNTIME_MS.queued) * 24)));
    return {
      ...job,
      status: "queued",
      updated_at: new Date(now).toISOString(),
      progress_pct: progressPct,
      stdout_tail: `[demo] queue accepted\n[demo] waiting for worker allocation`,
      state_history: [{ state: "queued", timestamp: job.created_at }],
    };
  }

  if (elapsedMs < DEMO_RUNTIME_MS.queued + DEMO_RUNTIME_MS.running) {
    const runningElapsed = elapsedMs - DEMO_RUNTIME_MS.queued;
    const progressPct = Math.min(
      92,
      28 + Math.floor((runningElapsed / DEMO_RUNTIME_MS.running) * 64),
    );
    return {
      ...job,
      status: "running",
      updated_at: new Date(now).toISOString(),
      progress_pct: progressPct,
      stdout_tail: buildRunningTail(job, elapsedMs),
      state_history: [
        { state: "queued", timestamp: job.created_at },
        { state: "running", timestamp: new Date(createdAt + DEMO_RUNTIME_MS.queued).toISOString() },
      ],
    };
  }

  const completedAt = createdAt + DEMO_RUNTIME_MS.queued + DEMO_RUNTIME_MS.running;
  return {
    ...job,
    status: "completed",
    updated_at: new Date(completedAt).toISOString(),
    progress_pct: 100,
    metrics: job.metrics ?? buildDemoMetrics(job.contract_key),
    summary_note:
      job.summary_note
      ?? `Demo run completed. ${job.contract_key} produced a stable verdict for presentation.`,
    stdout_tail: [
      `[demo] finalizing ${job.contract_key}`,
      `[demo] metrics exported to report bundle`,
      `[demo] demo verdict ready for review`,
    ].join("\n"),
    stderr_tail: "",
    state_history: [
      { state: "queued", timestamp: job.created_at },
      { state: "running", timestamp: new Date(createdAt + DEMO_RUNTIME_MS.queued).toISOString() },
      { state: "completed", timestamp: new Date(completedAt).toISOString() },
    ],
  };
}

export function listDemoJobs() {
  return [...getStore()]
    .map(materializeDemoJob)
    .sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export function findDemoJob(jobId: string) {
  const job = getStore().find((entry) => entry.job_id === jobId);
  return job ? materializeDemoJob(job) : null;
}

export function createDemoJob(draft: DemoJobDraft) {
  const now = new Date().toISOString();
  const job: DemoJobRecord = {
    job_id: `job_demo_${crypto.randomUUID().slice(0, 8)}`,
    status: "queued",
    contract_key: draft.contract_key ?? "recon_artifact_mainline",
    workspace_name:
      draft.workspace_name
      ?? `demo-${(draft.contract_key ?? "workspace").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase()}`,
    job_type: draft.job_type ?? inferJobType(draft.contract_key ?? "recon_artifact_mainline"),
    target_model: draft.target_model ?? inferTargetModel(draft.contract_key ?? "recon_artifact_mainline"),
    created_at: now,
    updated_at: now,
    summary_note: "Demo job accepted. It will auto-progress through queue, runtime, and report generation.",
    progress_pct: 8,
    stdout_tail: "[demo] job accepted into queue\n[demo] waiting for worker allocation",
    stderr_tail: "",
    state_history: [{ state: "queued", timestamp: now }],
  };
  getStore().unshift(job);
  return materializeDemoJob(job);
}

export function cancelDemoJob(jobId: string) {
  const store = getStore();
  const job = store.find((entry) => entry.job_id === jobId);
  if (!job) return null;
  const now = new Date().toISOString();
  job.status = "cancelled";
  job.updated_at = now;
  job.progress_pct = Math.min(job.progress_pct ?? 52, 72);
  job.state_history = [...(job.state_history ?? []), { state: "cancelled", timestamp: now }];
  job.stdout_tail = `${job.stdout_tail ?? ""}\n[demo] cancellation requested`;
  job.summary_note = job.summary_note ?? "Demo job was cancelled before the final report export step.";
  return materializeDemoJob(job);
}
