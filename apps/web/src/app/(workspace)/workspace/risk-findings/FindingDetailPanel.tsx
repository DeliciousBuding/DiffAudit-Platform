"use client";

import { X, Shield, ShieldCheck, ExternalLink, Link2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { CopyButton } from "@/components/copy-button";
import { StatusBadge } from "@/components/status-badge";
import { type Locale } from "@/components/language-picker";
import { useDismissibleLayer } from "@/hooks/use-dismissible-layer";
import { buildReportHref } from "@/lib/audit-flow";
import { WORKSPACE_COPY, RISK_NOTE_ZH } from "@/lib/workspace-copy";
import type { AttackDefenseRowViewModel } from "@/lib/workspace-source";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */


function getRiskDescription(attack: string, note: string, locale: string): string {
  if (note && note.length > 10) {
    if (locale === "zh-CN" && RISK_NOTE_ZH[note]) {
      return RISK_NOTE_ZH[note];
    }
    return note;
  }
  return attack;
}

function getStatus(defense: string, riskLevel: string): string {
  if (defense !== "none") return "has-defense";
  if (riskLevel === "high") return "investigating";
  return "monitoring";
}

function getCategory(track: string, copy: { catBlackBox: string; catGrayBox: string; catWhiteBox: string; catOther: string }): string {
  const map: Record<string, string> = {
    "black-box": copy.catBlackBox,
    "gray-box": copy.catGrayBox,
    "white-box": copy.catWhiteBox,
    other: copy.catOther,
  };
  return map[track] ?? track;
}

/* ------------------------------------------------------------------ */
/*  Detail Row                                                         */
/* ------------------------------------------------------------------ */

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Props = {
  finding: AttackDefenseRowViewModel | null;
  locale: string;
  onClose: () => void;
};

export function FindingDetailPanel({ finding, locale, onClose }: Props) {
  const copy = WORKSPACE_COPY[locale as Locale]?.riskFindings ?? WORKSPACE_COPY["en-US"].riskFindings;
  const panelRef = useRef<HTMLDivElement>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const panelOpen = finding !== null;

  useDismissibleLayer({
    enabled: panelOpen,
    rootRef: panelRef,
    onDismiss: onClose,
  });

  const handleCopyLink = useCallback(() => {
    if (!finding) return;
    const url = new URL(window.location.href);
    url.searchParams.set("model", finding.model);
    url.searchParams.set("severity", finding.riskLevel);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [finding]);

  /* Body scroll lock + focus restoration */
  useEffect(() => {
    if (!finding) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previousFocus?.focus();
    };
  }, [finding]);

  /* Focus trap */
  useEffect(() => {
    if (!finding) return;
    const timer = setTimeout(() => {
      panelRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [finding]);

  if (!finding) return null;

  const status = getStatus(finding.defense, finding.riskLevel);
  const description = getRiskDescription(finding.attack, finding.note ?? "", locale);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={copy.findingDetail}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-xl"
        style={{ animation: "slide-over-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[13px] font-bold text-foreground">
            {copy.findingDetail}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            aria-label={copy.close}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <dl className="space-y-5">
            {/* Risk Description */}
            <DetailRow label={copy.riskDescription}>
              <p className="leading-relaxed">{description}</p>
            </DetailRow>

            {/* Severity */}
            <DetailRow label={copy.severity}>
              <StatusBadge
                tone={
                  finding.riskLevel === "high"
                    ? "warning"
                    : finding.riskLevel === "medium"
                      ? "info"
                      : "success"
                }
              >
                {finding.riskLevel === "high"
                  ? copy.high
                  : finding.riskLevel === "medium"
                    ? copy.medium
                    : copy.low}
              </StatusBadge>
            </DetailRow>

            {/* Category */}
            <DetailRow label={copy.category}>
              <span>{getCategory(finding.track, copy)}</span>
            </DetailRow>

            {/* Source Model */}
            <DetailRow label={copy.sourceModel}>
              <div className="flex items-center gap-2">
                <span className="mono text-[12px]">{finding.model}</span>
                <CopyButton text={finding.model} label="model" />
              </div>
            </DetailRow>

            {/* Status */}
            <DetailRow label={copy.status}>
              <StatusBadge
                tone={
                  status === "has-defense"
                    ? "success"
                    : status === "monitoring"
                      ? "info"
                      : "warning"
                }
              >
                {status === "has-defense"
                  ? copy.hasDefenseStatus
                  : status === "monitoring"
                    ? copy.monitoring
                    : copy.investigating}
              </StatusBadge>
            </DetailRow>

            {/* Attack Vector */}
            <DetailRow label={copy.attackVector}>
              <span className="mono text-[12px]">{finding.attack}</span>
            </DetailRow>

            {/* Defense */}
            <DetailRow label={copy.defense}>
              <div className="flex items-center gap-2">
                {finding.defense !== "none" ? (
                  <>
                    <ShieldCheck size={14} strokeWidth={1.5} className="text-[var(--success)]" />
                    <span className="mono text-[12px]">{finding.defense}</span>
                    <CopyButton text={finding.defense} label="defense" />
                  </>
                ) : (
                  <>
                    <Shield size={14} strokeWidth={1.5} className="text-muted-foreground/40" />
                    <span className="text-muted-foreground text-[12px]">
                      {copy.noDefense}
                    </span>
                  </>
                )}
              </div>
            </DetailRow>

            {/* Metrics */}
            {finding.aucLabel && finding.aucLabel !== "n/a" && (
              <DetailRow label={copy.aucLabel}>
                <span className={`mono text-[12px] ${parseFloat(finding.aucLabel) > 0.85 ? "text-[var(--risk-high)] font-medium" : parseFloat(finding.aucLabel) > 0.7 ? "text-[var(--warning)]" : ""}`}>{finding.aucLabel}</span>
              </DetailRow>
            )}

            {finding.asrLabel && finding.asrLabel !== "n/a" && (
              <DetailRow label={copy.asrLabel}>
                <span className={`mono text-[12px] ${parseFloat(finding.asrLabel) > 0.5 ? "text-[var(--risk-high)] font-medium" : parseFloat(finding.asrLabel) > 0.3 ? "text-[var(--warning)]" : ""}`}>{finding.asrLabel}</span>
              </DetailRow>
            )}

            {finding.tprLabel && finding.tprLabel !== "n/a" && (
              <DetailRow label={copy.tprLabel}>
                <span className="mono text-[12px]">{finding.tprLabel}</span>
              </DetailRow>
            )}

            {finding.qualityCost && finding.qualityCost !== "n/a" && (
              <DetailRow label={copy.qualityCost}>
                <span className="mono text-[12px]">{finding.qualityCost}</span>
              </DetailRow>
            )}

            {finding.evidenceLevel && (
              <DetailRow label={copy.evidenceLevel}>
                <span className="text-[12px]">{finding.evidenceLevel}</span>
              </DetailRow>
            )}

            {finding.boundary && (
              <DetailRow label={copy.boundary}>
                <span className="mono text-[12px]">{finding.boundary}</span>
              </DetailRow>
            )}

            {/* Source path (if available) */}
            {finding.sourcePath && (
              <DetailRow label={copy.sourcePath}>
                <div className="flex items-center gap-2">
                  <span className="mono text-[12px] text-muted-foreground truncate max-w-[260px]">
                    {finding.sourcePath}
                  </span>
                  <CopyButton text={finding.sourcePath} label="source path" />
                </div>
              </DetailRow>
            )}
          </dl>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <Link
              href={buildReportHref(finding.track as "black-box" | "gray-box" | "white-box", "audit")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-blue)] transition-colors hover:text-foreground"
            >
              {copy.viewReport}
              <ExternalLink size={12} strokeWidth={1.5} />
            </Link>
            <Link
              href={`/workspace/audits/new?track=${encodeURIComponent(finding.track)}&model=${encodeURIComponent(finding.model)}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw size={12} strokeWidth={1.5} />
              {copy.reAudit}
            </Link>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
          >
            <Link2 size={13} strokeWidth={1.5} />
            {linkCopied ? copy.linkCopied : copy.copyLink}
          </button>
        </div>
      </div>
    </>
  );
}
