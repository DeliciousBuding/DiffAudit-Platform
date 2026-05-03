"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Info, X } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

type AttackType = "black-box" | "gray-box" | "white-box";

type ModelOption = {
  contractKey: string;
  label: string;
  track: string;
  capabilityLabel: string;
  availability: string;
};

type CreateTaskClientProps = {
  locale: Locale;
  availableModels: ModelOption[];
};

type FormState = {
  step: number;
  selectedModelLabel: string | null;
  selectedAttackTypes: AttackType[];
  rounds: number;
  batchSize: number;
  adaptiveSampling: boolean;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

type JobCreationResponse = {
  job_id?: string;
  status?: string;
  job?: {
    job_id?: string;
    status?: string;
  };
};

const ATTACK_TYPE_MAP: Record<AttackType, string> = {
  "black-box": "recon_artifact_mainline",
  "gray-box": "pia_runtime_mainline",
  "white-box": "gsa_runtime_mainline",
};

const ATTACK_TYPES: AttackType[] = ["black-box", "gray-box", "white-box"];

function attackTypeFromTrack(track: string): AttackType | null {
  if (track === "black-box" || track === "gray-box" || track === "white-box") return track;
  return null;
}

function trackLabel(track: string, locale: Locale) {
  if (track === "black-box") return locale === "zh-CN" ? "Recon / 黑盒" : "Recon / Black-box";
  if (track === "gray-box") return locale === "zh-CN" ? "PIA / 灰盒" : "PIA / Gray-box";
  if (track === "white-box") return locale === "zh-CN" ? "GSA / 白盒" : "GSA / White-box";
  return track;
}

export function CreateTaskClient({ locale, availableModels }: CreateTaskClientProps) {
  const copy = WORKSPACE_COPY[locale].createTask;
  const labels = copy.labels;
  const router = useRouter();
  const roundsInputId = "create-audit-rounds";
  const batchSizeInputId = "create-audit-batch-size";

  const [form, setForm] = useState<FormState>({
    step: 1,
    selectedModelLabel: null,
    selectedAttackTypes: [],
    rounds: 10,
    batchSize: 32,
    adaptiveSampling: true,
  });

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const modelGroups = useMemo(() => {
    const groups = new Map<string, ModelOption[]>();
    for (const model of availableModels) {
      const list = groups.get(model.label) ?? [];
      list.push(model);
      groups.set(model.label, list);
    }
    return Array.from(groups.entries()).map(([label, models]) => ({ label, models }));
  }, [availableModels]);

  const selectedModelGroup = useMemo(() => {
    if (!form.selectedModelLabel) return null;
    return modelGroups.find((group) => group.label === form.selectedModelLabel) ?? null;
  }, [form.selectedModelLabel, modelGroups]);

  const selectedContracts = useMemo(() => {
    const entries = new Map<AttackType, ModelOption>();
    for (const model of selectedModelGroup?.models ?? []) {
      const type = attackTypeFromTrack(model.track);
      if (type) entries.set(type, model);
    }
    return entries;
  }, [selectedModelGroup]);

  const setStep = useCallback((step: number) => {
    setForm((prev) => ({ ...prev, step }));
  }, []);

  const selectModel = useCallback((label: string) => {
    setForm((prev) => ({
      ...prev,
      selectedModelLabel: label,
      selectedAttackTypes: [],
      step: 2,
    }));
  }, []);

  const toggleAttackType = useCallback((type: AttackType) => {
    if (!selectedContracts.has(type)) return;
    setForm((prev) => {
      const selected = prev.selectedAttackTypes.includes(type)
        ? prev.selectedAttackTypes.filter((item) => item !== type)
        : [...prev.selectedAttackTypes, type];
      return { ...prev, selectedAttackTypes: selected };
    });
  }, [selectedContracts]);

  const selectedModel = useMemo(() => {
    const firstType = form.selectedAttackTypes[0];
    return firstType ? selectedContracts.get(firstType) ?? null : selectedModelGroup?.models[0] ?? null;
  }, [form.selectedAttackTypes, selectedContracts, selectedModelGroup]);

  const canReview = Boolean(form.selectedModelLabel && form.selectedAttackTypes.length > 0);

  const createOneJob = useCallback(async (attackType: AttackType, contractKey: string) => {
    const templateUrl = `/api/v1/audit/job-template?contract_key=${encodeURIComponent(contractKey)}`;
    const templateResponse = await fetch(templateUrl, { cache: "no-store" });

    let templatePayload: Record<string, unknown>;
    if (templateResponse.ok) {
      templatePayload = (await templateResponse.json()) as Record<string, unknown>;
    } else {
      templatePayload = {
        job_type: ATTACK_TYPE_MAP[attackType],
        contract_key: contractKey,
        workspace_name: "default",
        runtime_profile: "local",
        assets: {},
        job_inputs: {
          rounds: form.rounds,
          batch_size: form.batchSize,
          adaptive_sampling: form.adaptiveSampling,
        },
      };
    }

    const payload = {
      ...templatePayload,
      job_type: ATTACK_TYPE_MAP[attackType],
      contract_key: contractKey,
      job_inputs: {
        ...(typeof templatePayload.job_inputs === "object" && templatePayload.job_inputs !== null
          ? templatePayload.job_inputs as Record<string, unknown>
          : {}),
        rounds: form.rounds,
        batch_size: form.batchSize,
        adaptive_sampling: form.adaptiveSampling,
      },
    };

    const createResponse = await fetch("/api/v1/audit/jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!createResponse.ok) {
      let detail = `Request failed: ${createResponse.status}`;
      try {
        const body = (await createResponse.json()) as Record<string, unknown>;
        if (typeof body.detail === "string") detail = body.detail;
      } catch { /* fall through */ }
      throw new Error(detail);
    }

    return (await createResponse.json().catch(() => null)) as JobCreationResponse | null;
  }, [form.adaptiveSampling, form.batchSize, form.rounds]);

  const handleSubmit = useCallback(async () => {
    if (!canReview) return;

    setSubmitState("submitting");
    setErrorMessage(null);

    try {
      const createdJobs: JobCreationResponse[] = [];
      for (const attackType of form.selectedAttackTypes) {
        const model = selectedContracts.get(attackType);
        if (!model) continue;
        const created = await createOneJob(attackType, model.contractKey);
        if (created) createdJobs.push(created);
      }
      const created = createdJobs[0] ?? null;
      const createdJobId = created?.job?.job_id ?? created?.job_id ?? null;
      setSubmitState("success");

      // Redirect after a short delay
      redirectTimerRef.current = setTimeout(() => {
        router.push(createdJobId ? `/workspace/audits/${createdJobId}` : "/workspace/audits");
      }, 3000);
    } catch (err) {
      setSubmitState("error");
      setErrorMessage(err instanceof Error ? err.message : labels.submissionFailed);
    }
  }, [canReview, createOneJob, form.selectedAttackTypes, labels.submissionFailed, router, selectedContracts]);

  // Step indicator
  const steps = [
    { label: copy.steps.step1Label, title: copy.steps.step1Title },
    { label: copy.steps.step2Label, title: copy.steps.step2Title },
    { label: copy.steps.step3Label, title: copy.steps.step3Title },
    { label: copy.steps.step4Label, title: copy.steps.step4Title },
  ];

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-0 border-b border-border bg-muted/20 rounded-t-2xl" role="list" aria-label={copy.steps.stepperLabel}>
          {steps.map((step, index) => {
            const isActive = form.step === index + 1;
            const isCompleted = form.step > index + 1;
            const isDisabled = !isActive && !isCompleted;
            return (
              <div key={step.label} role="listitem" className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (isCompleted) setStep(index + 1);
                  }}
                  disabled={isDisabled}
                  aria-current={isActive ? "step" : undefined}
                  aria-disabled={isDisabled}
                  className={`flex w-full flex-col items-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors ${
                    isActive
                      ? "text-foreground border-b-2 border-b-[var(--accent-blue)]"
                      : isCompleted
                        ? "text-muted-foreground hover:text-foreground cursor-pointer"
                        : "text-muted-foreground cursor-default"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold ${
                      isCompleted
                        ? "bg-[var(--info-soft)] text-[var(--info)] border border-[var(--accent-blue)]/20"
                        : isActive
                          ? "bg-[var(--accent-blue)] text-background"
                          : "bg-muted/40 text-muted-foreground border border-border"
                    }`}
                  >
                    {isCompleted ? "\u2713" : step.label}
                  </span>
                  <span className="text-center leading-tight truncate">{step.title}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="p-4">
          {/* Step 1: Target model selection */}
          {form.step === 1 && (
            <div className="space-y-3">
              <div className="text-[13px] text-muted-foreground mb-3">
                {locale === "zh-CN" ? "先选择目标模型；下一步可为同一个模型勾选多条审计路线。" : "Select a target model first. You can choose multiple audit routes for the same model next."}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {modelGroups.map((group) => {
                  const isSelected = form.selectedModelLabel === group.label;
                  const routeCount = group.models.length;
                  return (
                    <button
                      key={group.label}
                      type="button"
                      onClick={() => selectModel(group.label)}
                      aria-pressed={isSelected}
                      className={`text-left rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-[var(--accent-blue)] bg-[var(--info-soft)] ring-1 ring-[var(--accent-blue)]/12"
                          : "border-border bg-background hover:border-[var(--accent-blue)]/30 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-bold">{group.label}</span>
                        <StatusBadge tone="info" compact>
                          {routeCount} {locale === "zh-CN" ? "条路线" : "routes"}
                        </StatusBadge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {group.models.map((model) => (
                          <span key={model.contractKey} className="rounded-full border border-border bg-muted/20 px-2 py-0.5 text-[10px] text-muted-foreground">
                            {trackLabel(model.track, locale)}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-[13px] text-muted-foreground">{group.models[0]?.capabilityLabel}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Audit route selection */}
          {form.step === 2 && (
            <div className="space-y-3">
              {/* Recommended configuration — 7.2.1 */}
              {form.selectedAttackTypes.length > 0 && (
                <div className="border border-[var(--accent-blue)]/30 bg-[var(--accent-blue)]/5 rounded-2xl p-4">
                  <div className="flex items-start gap-2">
                    <Info size={16} strokeWidth={1.5} className="shrink-0 text-[var(--accent-blue)] mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-[13px] font-bold text-[var(--accent-blue)]">
                        {locale === "zh-CN" ? "已选择审计路线" : "Selected audit routes"}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {form.selectedAttackTypes.map((type) => (
                          <StatusBadge key={type} tone={type === "white-box" ? "warning" : type === "gray-box" ? "info" : "neutral"} compact>
                            {trackLabel(type, locale)}
                          </StatusBadge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-[13px] text-muted-foreground mb-3">
                {locale === "zh-CN" ? "为该模型选择要同时创建的审计路线。每条路线会生成一个独立任务，报告中心会按任务逐行展示。" : "Choose the audit routes to create for this model. Each route creates one task and one report row."}
              </div>
              {!selectedModelGroup ? (
                <div className="text-[13px] text-muted-foreground text-center py-6 border border-dashed border-border rounded-2xl">
                  {labels.disabled}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                  {ATTACK_TYPES.map((type) => {
                    const model = selectedContracts.get(type);
                    const isSelected = form.selectedAttackTypes.includes(type);
                    const isDisabled = !model || model.availability === "disabled";
                    const title = type === "black-box" ? copy.attackTypes.blackBoxTitle : type === "gray-box" ? copy.attackTypes.grayBoxTitle : copy.attackTypes.whiteBoxTitle;
                    const desc = type === "black-box" ? copy.attackTypes.blackBoxDesc : type === "gray-box" ? copy.attackTypes.grayBoxDesc : copy.attackTypes.whiteBoxDesc;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleAttackType(type)}
                        aria-pressed={isSelected}
                        disabled={isDisabled}
                        className={`text-left rounded-2xl border p-4 flex flex-col transition-all ${
                          isSelected
                            ? "border-[var(--accent-blue)] bg-[var(--info-soft)] ring-1 ring-[var(--accent-blue)]/12"
                            : isDisabled
                              ? "border-border bg-muted/10 opacity-55 cursor-not-allowed"
                              : "border-border bg-background hover:border-[var(--accent-blue)]/30 hover:bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[13px] font-bold">{title}</span>
                          <StatusBadge
                            tone={model?.availability === "ready" ? "success" : model?.availability === "partial" ? "warning" : "neutral"}
                            compact
                          >
                            {!model
                              ? labels.availabilityDisabled
                              : model.availability === "ready"
                              ? labels.availabilityReady
                              : model.availability === "partial"
                                ? labels.availabilityPartial
                                : labels.availabilityDisabled}
                          </StatusBadge>
                        </div>
                        <div className="text-[13px] text-muted-foreground mb-2 leading-relaxed flex-1">{desc}</div>
                        <div className="mono text-[12px] text-muted-foreground">{model?.contractKey ?? "--"}</div>
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Back button */}
              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="workspace-btn-secondary px-3 py-1.5 text-[13px] font-medium"
                >
                  &larr; {copy.steps.step1Title}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Configure parameters */}
          {form.step === 3 && (
            <div className="space-y-4 max-w-md">
              <div className="text-[13px] text-muted-foreground mb-3">{copy.steps.step3Desc}</div>

              {/* Rounds */}
              <div>
                <label htmlFor={roundsInputId} className="block text-[13px] font-bold text-muted-foreground mb-1.5">
                  {labels.rounds}
                </label>
                <input
                  id={roundsInputId}
                  type="number"
                  min={1}
                  max={1000}
                  value={form.rounds}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!Number.isNaN(val) && val > 0) {
                      setForm((prev) => ({ ...prev, rounds: val }));
                    }
                  }}
                  className="settings-input"
                />
              </div>

              {/* Batch size */}
              <div>
                <label htmlFor={batchSizeInputId} className="block text-[13px] font-bold text-muted-foreground mb-1.5">
                  {labels.batchSize}
                </label>
                <input
                  id={batchSizeInputId}
                  type="number"
                  min={1}
                  max={512}
                  value={form.batchSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!Number.isNaN(val) && val > 0) {
                      setForm((prev) => ({ ...prev, batchSize: val }));
                    }
                  }}
                  className="settings-input"
                />
              </div>

              {/* Adaptive sampling toggle */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.adaptiveSampling}
                  aria-label={labels.adaptiveSampling}
                  onClick={() => setForm((prev) => ({ ...prev, adaptiveSampling: !prev.adaptiveSampling }))}
                  className={`mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    form.adaptiveSampling ? "bg-[var(--accent-blue)]" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform ${
                      form.adaptiveSampling ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <div>
                  <div className="text-[13px] font-bold">{labels.adaptiveSampling}</div>
                  <div className="text-[13px] text-muted-foreground mt-0.5">{labels.adaptiveSamplingNote}</div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="workspace-btn-secondary px-3 py-1.5 text-[13px] font-medium"
                >
                  &larr; {copy.steps.step2Title}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!canReview}
                  className="workspace-btn-primary px-3 py-1.5 text-[13px] font-medium"
                >
                  {copy.steps.step4Title} &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & submit */}
          {form.step === 4 && (
            <div className="space-y-4 max-w-lg">
              <div className="text-[13px] text-muted-foreground mb-3">{labels.reviewSummary}</div>

              {/* Review card */}
              <div className="border border-border rounded-2xl bg-muted/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-muted-foreground">
                    {labels.reviewAttackType}
                  </span>
                  <span className="text-[13px] font-medium">
                    {form.selectedAttackTypes.map((type) => trackLabel(type, locale)).join(", ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-muted-foreground">
                    {labels.reviewModel}
                  </span>
                  <span className="text-[13px] font-medium mono">
                    {selectedModel?.label ?? form.selectedModelLabel ?? "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-muted-foreground">
                    {labels.reviewRounds}
                  </span>
                  <span className="text-[13px] mono">{form.rounds}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-muted-foreground">
                    {labels.reviewBatchSize}
                  </span>
                  <span className="text-[13px] mono">{form.batchSize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-muted-foreground">
                    {labels.reviewAdaptiveSampling}
                  </span>
                  <span className="text-[13px]">
                    {form.adaptiveSampling ? labels.adaptiveOn : labels.adaptiveOff}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-[13px] font-bold text-muted-foreground">
                    {labels.reviewEstTime}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    ~{form.rounds * 2}s {labels.estimatedSuffix}
                  </span>
                </div>
              </div>

              {/* Success state */}
              {submitState === "success" && (
                <div className="border border-[var(--success-soft)] rounded-2xl bg-[var(--success-soft)] p-4">
                  <div className="text-[13px] font-bold text-[var(--success)]">{labels.successTitle}</div>
                  <div className="text-[13px] text-muted-foreground mt-1">{labels.successBody}</div>
                  <button
                    type="button"
                    onClick={() => router.push("/workspace/audits")}
                    className="mt-3 workspace-btn-secondary px-3 py-1.5 text-[13px] font-medium"
                  >
                    {labels.goToTasks}
                  </button>
                </div>
              )}

              {/* Error state */}
              {submitState === "error" && errorMessage && (
                <div className="border border-[var(--warning-soft)] rounded-2xl bg-[var(--warning-soft)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[13px] text-[var(--warning)]">{errorMessage}</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitState("idle");
                        setErrorMessage(null);
                      }}
                      className="shrink-0 rounded p-0.5 text-[var(--warning)] hover:bg-[var(--warning)]/10 transition-colors"
                      aria-label={labels.dismissError}
                    >
                      <X size={14} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={submitState === "submitting"}
                  className="workspace-btn-secondary px-3 py-1.5 text-[13px] font-medium disabled:opacity-50"
                >
                  &larr; {copy.steps.step3Title}
                </button>
                {submitState !== "success" && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitState === "submitting"}
                    className="workspace-btn-primary px-4 py-1.5 text-[13px] font-medium disabled:opacity-70"
                  >
                    {submitState === "submitting" ? labels.submitting : labels.submitButton}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
