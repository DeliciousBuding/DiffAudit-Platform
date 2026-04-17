import crypto from "node:crypto";

import { DEMO_JOBS, type DemoJobRecord } from "@/lib/demo-snapshot";

type DemoJobDraft = {
  contract_key?: string;
  workspace_name?: string;
  job_type?: string;
  target_model?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __diffauditDemoJobs__: DemoJobRecord[] | undefined;
}

function getStore() {
  if (!globalThis.__diffauditDemoJobs__) {
    globalThis.__diffauditDemoJobs__ = [...DEMO_JOBS];
  }
  return globalThis.__diffauditDemoJobs__;
}

export function listDemoJobs() {
  return [...getStore()].sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export function findDemoJob(jobId: string) {
  return getStore().find((job) => job.job_id === jobId) ?? null;
}

export function createDemoJob(draft: DemoJobDraft) {
  const now = new Date().toISOString();
  const job: DemoJobRecord = {
    job_id: `job_demo_${crypto.randomUUID().slice(0, 8)}`,
    status: "queued",
    contract_key: draft.contract_key ?? "recon_artifact_mainline",
    workspace_name: draft.workspace_name ?? "demo-workspace",
    job_type: draft.job_type ?? "recon_artifact_mainline",
    target_model: draft.target_model ?? "demo-model",
    created_at: now,
    updated_at: now,
    stdout_tail: "[demo] job accepted into queue\n[demo] waiting for worker allocation",
    stderr_tail: "",
    state_history: [{ state: "queued", timestamp: now }],
  };
  getStore().unshift(job);
  return job;
}

export function cancelDemoJob(jobId: string) {
  const store = getStore();
  const job = store.find((entry) => entry.job_id === jobId);
  if (!job) return null;
  const now = new Date().toISOString();
  job.status = "cancelled";
  job.updated_at = now;
  job.state_history = [...(job.state_history ?? []), { state: "cancelled", timestamp: now }];
  job.stdout_tail = `${job.stdout_tail ?? ""}\n[demo] cancellation requested`;
  return job;
}
