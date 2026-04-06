"use client";

import { useEffect, useState } from "react";

import {
  buildArtifactReplayJobPayload,
  summarizeBestRecon,
} from "@/lib/audit-client";

const methods = [
  { label: "黑盒 / Recon", tone: "text-[var(--accent)]" },
  { label: "灰盒 / PIA", tone: "text-[var(--accent-2)]" },
  { label: "白盒 / Attention", tone: "text-[var(--accent-3)]" },
];

type ModelOption = {
  key: string;
  label: string;
  access_level: string;
  availability: string;
};

type BestRecon = {
  workspace: string;
  backend?: string | null;
  scheduler?: string | null;
  metrics?: {
    auc?: number | null;
    asr?: number | null;
    tpr_at_1pct_fpr?: number | null;
  };
  artifact_paths?: {
    score_artifact_dir?: string;
  };
};

type AuditJob = {
  job_id: string;
  status: string;
  workspace_name: string;
  summary_path?: string | null;
  metrics?: {
    auc?: number | null;
    asr?: number | null;
    tpr_at_1pct_fpr?: number | null;
  } | null;
  error?: string | null;
};

function buildWorkspaceName() {
  return `audit-replay-${Date.now()}`;
}

export default function AuditPage() {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [bestRecon, setBestRecon] = useState<BestRecon | null>(null);
  const [jobs, setJobs] = useState<AuditJob[]>([]);
  const [activeJob, setActiveJob] = useState<AuditJob | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>("");

  async function loadModels() {
    const response = await fetch("/api/v1/models", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("加载模型列表失败");
    }
    setModels(await response.json());
  }

  async function loadBestRecon() {
    const response = await fetch("/api/v1/experiments/recon/best", {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("加载最强 recon 证据失败");
    }
    setBestRecon(await response.json());
  }

  async function loadJobs() {
    const response = await fetch("/api/v1/audit/jobs", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("加载任务列表失败");
    }
    const payload = (await response.json()) as AuditJob[];
    setJobs(payload);
    setActiveJob(payload[0] ?? null);
  }

  useEffect(() => {
    void Promise.all([loadModels(), loadBestRecon(), loadJobs()]).catch((reason) => {
      setError(reason instanceof Error ? reason.message : "初始化页面失败");
    });
  }, []);

  useEffect(() => {
    if (!activeJob || !["queued", "running"].includes(activeJob.status)) {
      return;
    }

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/v1/audit/jobs/${activeJob.job_id}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as AuditJob;
      setActiveJob(payload);
      setJobs((current) =>
        current.map((job) => (job.job_id === payload.job_id ? payload : job)),
      );
    }, 2500);

    return () => window.clearInterval(timer);
  }, [activeJob]);

  async function submitReplayJob() {
    if (!bestRecon) {
      setError("最强 recon 证据尚未加载完成");
      return;
    }

    setPending(true);
    setError("");
    try {
      const payload = buildArtifactReplayJobPayload(
        bestRecon,
        buildWorkspaceName(),
      );
      const response = await fetch("/api/v1/audit/jobs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(
          typeof failure.detail === "string" ? failure.detail : "提交任务失败",
        );
      }
      const created = (await response.json()) as AuditJob;
      setActiveJob(created);
      setJobs((current) => [created, ...current]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "提交任务失败");
    } finally {
      setPending(false);
    }
  }

  const selectedModel = models.find((item) => item.key === "sd15-ddim");
  const bestSummary = bestRecon ? summarizeBestRecon(bestRecon) : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <section className="glass-card p-6">
        <div className="mono text-xs uppercase tracking-[0.12em] text-[var(--muted-2)]">
          Audit Intake
        </div>
        <h1 className="mt-3 text-2xl font-semibold">图像成员推断检测</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          第一版先接稳定主线：直接复用当前最强 `recon` 证据的 artifact，
          提交一条可追踪任务，后续再把真实上传和自定义输入接进来。
        </p>

        <div className="mt-6 rounded-2xl border border-dashed border-[rgba(79,255,176,0.25)] bg-[rgba(79,255,176,0.03)] px-6 py-10 text-center">
          <div className="text-sm text-[var(--foreground)]">当前先复用 best recon artifact 提交任务</div>
          <div className="mt-2 text-xs text-[var(--muted-2)]">
            上传和自定义数据输入后续再接，先把真实任务流打通
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="glass-card p-4">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
              Target model
            </div>
            <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
              {selectedModel?.label ?? "loading..."}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
              Audit policy
            </div>
            <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
              Recon / artifact replay
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {methods.map((method) => (
            <span
              key={method.label}
              className={`mono rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs ${method.tone}`}
            >
              {method.label}
            </span>
          ))}
        </div>

        {bestRecon ? (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
              Best recon evidence
            </div>
            <div className="mt-3 text-sm text-[var(--foreground)]">{bestRecon.workspace}</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
                <div className="mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
                  Backend
                </div>
                <div className="mt-2">{bestSummary?.backendLabel}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
                <div className="mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
                  AUC
                </div>
                <div className="mt-2">{bestSummary?.aucLabel}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
                <div className="mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
                  TPR@1%FPR
                </div>
                <div className="mt-2">{bestSummary?.tprLabel}</div>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-xl border border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        <button
          onClick={() => {
            void submitReplayJob();
          }}
          disabled={pending || !bestRecon}
          className="mt-6 w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "提交中..." : "提交审计任务"}
        </button>
      </section>

      <section className="grid gap-4">
        <div className="glass-card p-5">
          <div className="mono text-xs uppercase tracking-[0.08em] text-[var(--muted-2)]">
            Active job
          </div>
          {activeJob ? (
            <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <div>job_id: {activeJob.job_id}</div>
              <div>status: {activeJob.status}</div>
              <div>workspace: {activeJob.workspace_name}</div>
              <div>summary: {activeJob.summary_path ?? "pending"}</div>
              <div>
                auc: {typeof activeJob.metrics?.auc === "number" ? activeJob.metrics.auc.toFixed(3) : "pending"}
              </div>
              {activeJob.error ? <div className="text-[var(--danger)]">{activeJob.error}</div> : null}
            </div>
          ) : (
            <div className="mt-4 text-sm text-[var(--muted)]">暂无任务</div>
          )}
        </div>
        <div className="glass-card p-5">
          <div className="mono text-xs uppercase tracking-[0.08em] text-[var(--muted-2)]">
            Recent jobs
          </div>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            {jobs.length > 0 ? (
              jobs.slice(0, 5).map((job) => (
                <button
                  key={job.job_id}
                  onClick={() => setActiveJob(job)}
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-3 text-left transition hover:border-[rgba(79,255,176,0.25)] hover:bg-[rgba(79,255,176,0.04)]"
                >
                  <div className="text-[var(--foreground)]">{job.workspace_name}</div>
                  <div className="mt-1 mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
                    {job.status} / {job.job_id}
                  </div>
                </button>
              ))
            ) : (
              <div>尚未提交任务</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
