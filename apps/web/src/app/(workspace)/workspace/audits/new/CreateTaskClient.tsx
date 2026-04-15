"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

// Spinner component for loading states
function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

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

  const [form, setForm] = useState<FormState>({
    step: 1,
    attackType: null,
    selectedContractKey: null,
    rounds: 10,
    batchSize: 32,
    adaptiveSampling: true,
  });

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [stepTransitioning, setStepTransitioning] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

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
    setStepTransitioning(true);
    setForm((prev) => ({ ...prev, step }));
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => setStepTransitioning(false), 300);
  }, []);

  const selectAttackType = useCallback((type: AttackType) => {
    setCatalogLoading(true);
    setStepTransitioning(true);
    setForm((prev) => ({
      ...prev,
      attackType: type,
      selectedContractKey: null, // Reset model when attack type changes
      step: 2,
    }));
    // Simulate catalog loading time
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setCatalogLoading(false);
      setStepTransitioning(false);
    }, 300);
  }, []);

  const selectModel = useCallback((contractKey: string) => {
    setStepTransitioning(true);
    setForm((prev) => ({ ...prev, selectedContractKey: contractKey, step: 3 }));
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => setStepTransitioning(false), 300);
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

      setSubmitState("success");

      // Redirect after a short delay
      redirectTimerRef.current = setTimeout(() => {
        router.push("/workspace/audits");
      }, 1500);
    } catch (err) {
      setSubmitState("error");
      setErrorMessage(err instanceof Error ? err.message : labels.submissionFailed);
    }
  }, [form.attackType, form.selectedContractKey, form.rounds, form.batchSize, form.adaptiveSampling, router]);

  // Cleanup redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  // Step indicator
  const steps = [
    { label: copy.steps.step1Label, title: copy.steps.step1Title },
    { label: copy.steps.step2Label, title: copy.steps.step2Title },
    { label: copy.steps.step3Label, title: copy.steps.step3Title },
    { label: copy.steps.step4Label, title: copy.steps.step4Title },
  ];

  const canGoNext = useMemo(() => {
    switch (form.step) {
      case 1: return form.attackType !== null;
      case 2: return form.selectedContractKey !== null;
      case 3: return true;
      case 4: return false;
      default: return false;
    }
  }, [form.step, form.attackType, form.selectedContractKey]);

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="border border-border bg-card">
        {/* Progress header */}
        <div className="px-4 py-3 border-b border-border bg-muted/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">
              {labels.stepProgress || "Step"} {form.step} {labels.stepOf || "of"} {steps.length}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {Math.round((form.step / steps.length) * 100)}% {labels.complete || "complete"}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-blue)] transition-all duration-300 ease-out"
              style={{ width: `${(form.step / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step tabs */}
        <div className="flex items-center gap-0 border-b border-border bg-muted/20 overflow-x-auto snap-x snap-mandatory scrollbar-thin">
          {steps.map((step, index) => {
            const isActive = form.step === index + 1;
            const isCompleted = form.step > index + 1;
            return (
              <button
                key={step.label}
                type="button"
                onClick={() => {
                  if (isCompleted) setStep(index + 1);
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 snap-start ${
                  isActive
                    ? "text-foreground border-b-2 border-b-[var(--accent-blue)]"
                    : isCompleted
                      ? "text-muted-foreground hover:text-foreground cursor-pointer"
                      : "text-muted-foreground cursor-default"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-semibold ${
                    isCompleted
                      ? "bg-[var(--info-soft)] text-[var(--info)] border border-[rgba(47,109,246,0.2)]"
                      : isActive
                        ? "bg-[var(--accent-blue)] text-white"
                        : "bg-muted/40 text-muted-foreground border border-border"
                  }`}
                >
                  {isCompleted ? "\u2713" : step.label}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div className="p-4">
          {/* Step 1: Attack type selection */}
          {form.step === 1 && (
            <div className={`space-y-3 transition-opacity duration-300 ${stepTransitioning ? "opacity-50" : "opacity-100"}`}>
              <div className="text-xs text-muted-foreground mb-3">{copy.steps.step1Desc}</div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
                      className={`text-left rounded-lg border p-4 transition-all duration-200 ${
                        isSelected
                          ? "border-[var(--accent-blue)] bg-[var(--info-soft)] ring-1 ring-[rgba(47,109,246,0.12)]"
                          : "border-border bg-background hover:border-[rgba(47,109,246,0.3)] hover:bg-muted/20"
                      }`}
                    >
                      <div className="text-sm font-semibold mb-1.5">{card.title}</div>
                      <div className="text-xs text-muted-foreground mb-2 leading-relaxed">{card.desc}</div>
                      <div className="text-xs text-muted-foreground italic">{card.note}</div>
                    </button>
                  );
                })}
              </div>
              {/* Recommended configuration — 7.2.1 */}
              {form.attackType && (
                <div className="border border-[color:var(--accent-blue)]/30 bg-[color:var(--accent-blue)]/5 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[color:var(--accent-blue)] mt-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-blue)]">
                        {form.attackType === "black-box" ? copy.recommendedConfig.blackBoxTitle : form.attackType === "gray-box" ? copy.recommendedConfig.grayBoxTitle : copy.recommendedConfig.whiteBoxTitle}
                      </div>
                      <ul className="space-y-0.5">
                        <li className="text-xs text-muted-foreground">
                          {form.attackType === "black-box" ? copy.recommendedConfig.blackBoxRounds : form.attackType === "gray-box" ? copy.recommendedConfig.grayBoxRounds : copy.recommendedConfig.whiteBoxRounds}
                        </li>
                        <li className="text-xs text-muted-foreground">
                          {form.attackType === "black-box" ? copy.recommendedConfig.blackBoxBatch : form.attackType === "gray-box" ? copy.recommendedConfig.grayBoxBatch : copy.recommendedConfig.whiteBoxBatch}
                        </li>
                        <li className="text-xs text-muted-foreground">
                          {form.attackType === "black-box" ? copy.recommendedConfig.blackBoxAdaptive : form.attackType === "gray-box" ? copy.recommendedConfig.grayBoxAdaptive : copy.recommendedConfig.whiteBoxAdaptive}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Target model selection */}
          {form.step === 2 && (
            <div className={`space-y-3 transition-opacity duration-300 ${stepTransitioning ? "opacity-50" : "opacity-100"}`}>
              <div className="text-xs text-muted-foreground mb-3">{copy.steps.step2Desc}</div>
              {catalogLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Spinner className="h-8 w-8 text-[var(--accent-blue)]" />
                  <div className="text-xs text-muted-foreground">Loading model catalog...</div>
                </div>
              ) : filteredModels.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
                  {labels.disabled}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredModels.map((model) => {
                    const isSelected = form.selectedContractKey === model.contractKey;
                    return (
                      <button
                        key={model.contractKey}
                        type="button"
                        onClick={() => selectModel(model.contractKey)}
                        disabled={catalogLoading}
                        className={`text-left rounded-lg border p-3 transition-all duration-200 disabled:opacity-50 ${
                          isSelected
                            ? "border-[var(--accent-blue)] bg-[var(--info-soft)] ring-1 ring-[rgba(47,109,246,0.12)]"
                            : "border-border bg-background hover:border-[rgba(47,109,246,0.3)] hover:bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium">{model.label}</span>
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
                        <div className="mono text-xs text-muted-foreground">{model.contractKey}</div>
                        <div className="text-xs text-muted-foreground mt-1">{model.capabilityLabel}</div>
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
                  disabled={catalogLoading}
                  className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 disabled:opacity-50"
                >
                  &larr; {copy.steps.step1Title}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Configure parameters */}
          {form.step === 3 && (
            <div className={`space-y-4 max-w-md transition-opacity duration-300 ${stepTransitioning ? "opacity-50" : "opacity-100"}`}>
              <div className="text-xs text-muted-foreground mb-3">{copy.steps.step3Desc}</div>

              {/* Rounds */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {labels.rounds}
                </label>
                <input
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
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none transition-colors hover:bg-muted/40 focus:border-[rgba(47,109,246,0.52)] focus:ring-2 focus:ring-[rgba(47,109,246,0.08)]"
                />
              </div>

              {/* Batch size */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {labels.batchSize}
                </label>
                <input
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
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none transition-colors hover:bg-muted/40 focus:border-[rgba(47,109,246,0.52)] focus:ring-2 focus:ring-[rgba(47,109,246,0.08)]"
                />
              </div>

              {/* Adaptive sampling toggle */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.adaptiveSampling}
                  onClick={() => setForm((prev) => ({ ...prev, adaptiveSampling: !prev.adaptiveSampling }))}
                  className={`mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    form.adaptiveSampling ? "bg-[var(--accent-blue)]" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-[var(--color-bg-primary)] shadow transition-transform ${
                      form.adaptiveSampling ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <div>
                  <div className="text-xs font-medium">{labels.adaptiveSampling}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{labels.adaptiveSamplingNote}</div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40"
                >
                  &larr; {copy.steps.step2Title}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 rounded border border-[var(--accent-blue)] bg-[var(--accent-blue)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-blue-hover)]"
                >
                  {copy.steps.step4Title} &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & submit */}
          {form.step === 4 && (
            <div className={`space-y-4 max-w-lg transition-opacity duration-300 ${stepTransitioning ? "opacity-50" : "opacity-100"}`}>
              <div className="text-xs text-muted-foreground mb-3">{labels.reviewSummary}</div>

              {/* Review card */}
              <div className="border border-border rounded-lg bg-muted/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {labels.reviewAttackType}
                  </span>
                  <span className="text-xs font-medium">
                    {form.attackType === "black-box"
                      ? copy.attackTypes.blackBoxTitle
                      : form.attackType === "gray-box"
                        ? copy.attackTypes.grayBoxTitle
                        : copy.attackTypes.whiteBoxTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {labels.reviewModel}
                  </span>
                  <span className="text-xs font-medium mono">
                    {selectedModel?.label ?? form.selectedContractKey ?? "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {labels.reviewRounds}
                  </span>
                  <span className="text-xs mono">{form.rounds}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {labels.reviewBatchSize}
                  </span>
                  <span className="text-xs mono">{form.batchSize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {labels.reviewAdaptiveSampling}
                  </span>
                  <span className="text-xs">
                    {form.adaptiveSampling ? labels.adaptiveOn : labels.adaptiveOff}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {labels.reviewEstTime}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ~{form.rounds * 2}s {labels.estimatedSuffix}
                  </span>
                </div>
              </div>

              {/* Success state */}
              {submitState === "success" && (
                <div className="border border-[var(--success-soft)] rounded-lg bg-[var(--success-soft)] p-4">
                  <div className="text-sm font-semibold text-[color:var(--success)]">{labels.successTitle}</div>
                  <div className="text-xs text-muted-foreground mt-1">{labels.successBody}</div>
                </div>
              )}

              {/* Error state */}
              {submitState === "error" && errorMessage && (
                <div className="border border-[var(--warning-soft)] rounded-lg bg-[var(--warning-soft)] p-4">
                  <div className="text-xs text-[color:var(--warning)]">{errorMessage}</div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={submitState === "submitting"}
                  className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 disabled:opacity-50"
                >
                  &larr; {copy.steps.step3Title}
                </button>
                {submitState !== "success" && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitState === "submitting"}
                    className="inline-flex items-center gap-1.5 rounded border border-[var(--accent-blue)] bg-[var(--accent-blue)] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-blue-hover)] disabled:opacity-70"
                  >
                    {submitState === "submitting" ? (
                      <>
                        <Spinner className="h-3 w-3" />
                        {labels.submitting}
                      </>
                    ) : (
                      labels.submitButton
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back link */}
      <div>
        <Link
          href="/workspace/audits"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; {copy.backToTasks}
        </Link>
      </div>
    </div>
  );
}
