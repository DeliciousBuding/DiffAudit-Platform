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
  attackType: AttackType | null;
  selectedContractKey: string | null;
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

const TRACK_FILTER_MAP: Record<AttackType, string> = {
  "black-box": "black-box",
  "gray-box": "gray-box",
  "white-box": "white-box",
};

export function CreateTaskClient({ locale, availableModels }: CreateTaskClientProps) {
  const copy = WORKSPACE_COPY[locale].createTask;
  const labels = copy.labels;
  const router = useRouter();
  const roundsInputId = "create-audit-rounds";
  const batchSizeInputId = "create-audit-batch-size";

  const [form, setForm] = useState<FormState>({
    step: 1,
    attackType: null,
    selectedContractKey: null,
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

  // Filter models by selected attack type track
  const filteredModels = useMemo(() => {
    if (!form.attackType) return [];
    const trackFilter = TRACK_FILTER_MAP[form.attackType];
    return availableModels.filter((m) => m.track === trackFilter);
  }, [form.attackType, availableModels]);

  const selectedModel = useMemo(() => {
    if (!form.selectedContractKey) return null;
    return availableModels.find((m) => m.contractKey === form.selectedContractKey) ?? null;
  }, [form.selectedContractKey, availableModels]);

  const setStep = useCallback((step: number) => {
    setForm((prev) => ({ ...prev, step }));
  }, []);

  const selectAttackType = useCallback((type: AttackType) => {
    setForm((prev) => ({
      ...prev,
      attackType: type,
      selectedContractKey: null, // Reset model when attack type changes
      step: 2,
    }));
  }, []);

  const selectModel = useCallback((contractKey: string) => {
    setForm((prev) => ({ ...prev, selectedContractKey: contractKey, step: 3 }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.attackType || !form.selectedContractKey) return;

    setSubmitState("submitting");
    setErrorMessage(null);

    try {
      // Fetch job template from API
      const templateUrl = `/api/v1/audit/job-template?contract_key=${encodeURIComponent(form.selectedContractKey)}`;
      const templateResponse = await fetch(templateUrl, { cache: "no-store" });

      let templatePayload: Record<string, unknown>;
      if (templateResponse.ok) {
        templatePayload = (await templateResponse.json()) as Record<string, unknown>;
      } else {
        // Fallback: construct minimal payload
        templatePayload = {
          job_type: ATTACK_TYPE_MAP[form.attackType],
          contract_key: form.selectedContractKey,
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

      // Merge user parameters into template
      const payload = {
        ...templatePayload,
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

      const created = (await createResponse.json().catch(() => null)) as JobCreationResponse | null;
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
  }, [form.attackType, form.selectedContractKey, form.rounds, form.batchSize, form.adaptiveSampling, labels.submissionFailed, router]);

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
                        ? "bg-[color:var(--info-soft)] text-[color:var(--info)] border border-[color:var(--accent-blue)]/20"
                        : isActive
                          ? "bg-[color:var(--accent-blue)] text-background"
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
          {/* Step 1: Attack type selection */}
          {form.step === 1 && (
            <div className="space-y-3">
              <div className="text-[13px] text-muted-foreground mb-3">{copy.steps.step1Desc}</div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                {(
                  [
                    {
                      type: "black-box" as AttackType,
                      title: copy.attackTypes.blackBoxTitle,
                      desc: copy.attackTypes.blackBoxDesc,
                      note: copy.attackTypes.blackBoxNote,
                    },
                    {
                      type: "gray-box" as AttackType,
                      title: copy.attackTypes.grayBoxTitle,
                      desc: copy.attackTypes.grayBoxDesc,
                      note: copy.attackTypes.grayBoxNote,
                    },
                    {
                      type: "white-box" as AttackType,
                      title: copy.attackTypes.whiteBoxTitle,
                      desc: copy.attackTypes.whiteBoxDesc,
                      note: copy.attackTypes.whiteBoxNote,
                    },
                  ] as const
                ).map((card) => {
                  const isSelected = form.attackType === card.type;
                  return (
                    <button
                      key={card.type}
                      type="button"
                      onClick={() => selectAttackType(card.type)}
                      aria-pressed={isSelected}
                      className={`text-left rounded-2xl border p-4 flex flex-col transition-all ${
                        isSelected
                          ? "border-[var(--accent-blue)] bg-[var(--info-soft)] ring-1 ring-[color:var(--accent-blue)]/12"
                          : "border-border bg-background hover:border-[color:var(--accent-blue)]/30 hover:bg-muted/20"
                      }`}
                    >
                      <div className="text-[13px] font-bold mb-1.5">{card.title}</div>
                      <div className="text-[13px] text-muted-foreground mb-2 leading-relaxed flex-1">{card.desc}</div>
                      <div className="text-[13px] text-muted-foreground italic pt-2 border-t border-border/40">{card.note}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Target model selection */}
          {form.step === 2 && (
            <div className="space-y-3">
              {/* Recommended configuration — 7.2.1 */}
              {form.attackType && (
                <div className="border border-[color:var(--accent-blue)]/30 bg-[color:var(--accent-blue)]/5 rounded-2xl p-4">
                  <div className="flex items-start gap-2">
                    <Info size={16} strokeWidth={1.5} className="shrink-0 text-[color:var(--accent-blue)] mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-[13px] font-bold text-[color:var(--accent-blue)]">
                        {form.attackType === "black-box" ? copy.recommendedConfig.blackBoxTitle : form.attackType === "gray-box" ? copy.recommendedConfig.grayBoxTitle : copy.recommendedConfig.whiteBoxTitle}
                      </div>
                      <ul className="space-y-0.5">
                        <li className="text-[13px] text-muted-foreground">
                          {form.attackType === "black-box" ? copy.recommendedConfig.blackBoxRounds : form.attackType === "gray-box" ? copy.recommendedConfig.grayBoxRounds : copy.recommendedConfig.whiteBoxRounds}
                        </li>
                        <li className="text-[13px] text-muted-foreground">
                          {form.attackType === "black-box" ? copy.recommendedConfig.blackBoxBatch : form.attackType === "gray-box" ? copy.recommendedConfig.grayBoxBatch : copy.recommendedConfig.whiteBoxBatch}
                        </li>
                        <li className="text-[13px] text-muted-foreground">
                          {form.attackType === "black-box" ? copy.recommendedConfig.blackBoxAdaptive : form.attackType === "gray-box" ? copy.recommendedConfig.grayBoxAdaptive : copy.recommendedConfig.whiteBoxAdaptive}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-[13px] text-muted-foreground mb-3">{copy.steps.step2Desc}</div>
              {filteredModels.length === 0 ? (
                <div className="text-[13px] text-muted-foreground text-center py-6 border border-dashed border-border rounded-2xl">
                  {labels.disabled}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredModels.map((model) => {
                    const isSelected = form.selectedContractKey === model.contractKey;
                    const isDisabled = model.availability === "disabled";
                    return (
                      <button
                        key={model.contractKey}
                        type="button"
                        onClick={() => {
                          if (!isDisabled) selectModel(model.contractKey);
                        }}
                        aria-pressed={isSelected}
                        disabled={isDisabled}
                        className={`text-left rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? "border-[var(--accent-blue)] bg-[var(--info-soft)] ring-1 ring-[color:var(--accent-blue)]/12"
                            : isDisabled
                              ? "border-border bg-muted/10 opacity-55 cursor-not-allowed"
                              : "border-border bg-background hover:border-[color:var(--accent-blue)]/30 hover:bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[13px] font-bold">{model.label}</span>
                          <StatusBadge
                            tone={model.availability === "ready" ? "success" : model.availability === "partial" ? "warning" : "neutral"}
                            compact
                          >
                            {model.availability === "ready"
                              ? labels.availabilityReady
                              : model.availability === "partial"
                                ? labels.availabilityPartial
                                : labels.availabilityDisabled}
                          </StatusBadge>
                        </div>
                        <div className="mono text-[13px] text-muted-foreground">{model.contractKey}</div>
                        <div className="text-[13px] text-muted-foreground mt-1">{model.capabilityLabel}</div>
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
                    {form.attackType === "black-box"
                      ? copy.attackTypes.blackBoxTitle
                      : form.attackType === "gray-box"
                        ? copy.attackTypes.grayBoxTitle
                        : copy.attackTypes.whiteBoxTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-muted-foreground">
                    {labels.reviewModel}
                  </span>
                  <span className="text-[13px] font-medium mono">
                    {selectedModel?.label ?? form.selectedContractKey ?? "--"}
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
                  <div className="text-[13px] font-bold text-[color:var(--success)]">{labels.successTitle}</div>
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
                    <div className="text-[13px] text-[color:var(--warning)]">{errorMessage}</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitState("idle");
                        setErrorMessage(null);
                      }}
                      className="shrink-0 rounded p-0.5 text-[color:var(--warning)] hover:bg-[color:var(--warning)]/10 transition-colors"
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
