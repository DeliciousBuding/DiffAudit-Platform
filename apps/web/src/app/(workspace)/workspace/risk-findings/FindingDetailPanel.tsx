"use client";

import { X, Shield, ShieldCheck, ExternalLink, Link2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { CopyButton } from "@/components/copy-button";
import { StatusBadge } from "@/components/status-badge";
import { buildReportHref } from "@/lib/audit-flow";
import type { AttackDefenseRowViewModel } from "@/lib/workspace-source";

/* ------------------------------------------------------------------ */
/*  Localized copy                                                     */
/* ------------------------------------------------------------------ */

const DETAIL_COPY: Record<
  string,
  {
    findingDetail: string;
    riskDescription: string;
    severity: string;
    category: string;
    sourceModel: string;
    status: string;
    attackVector: string;
    defense: string;
    auc: string;
    asr: string;
    tpr: string;
    qualityCost: string;
    evidenceLevel: string;
    boundary: string;
    close: string;
    high: string;
    medium: string;
    low: string;
    hasDefenseStatus: string;
    monitoring: string;
    investigating: string;
    noDefense: string;
    relatedAudit: string;
    viewReport: string;
    copyLink: string;
    linkCopied: string;
    sourcePath: string;
  }
> = {
  "en-US": {
    findingDetail: "Finding Detail",
    riskDescription: "Risk Description",
    severity: "Severity",
    category: "Category",
    sourceModel: "Source Model",
    status: "Status",
    attackVector: "Attack Vector",
    defense: "Defense",
    auc: "AUC",
    asr: "ASR",
    tpr: "TPR",
    qualityCost: "Quality Cost",
    evidenceLevel: "Evidence Level",
    boundary: "Boundary",
    close: "Close",
    high: "High",
    medium: "Medium",
    low: "Low",
    hasDefenseStatus: "Has Defense",
    monitoring: "Monitoring",
    investigating: "Investigating",
    noDefense: "None",
    relatedAudit: "Related Audit",
    viewReport: "View Report",
    copyLink: "Copy Link",
    linkCopied: "Copied!",
    sourcePath: "Source Path",
    reAudit: "Re-audit",
  },
  "zh-CN": {
    findingDetail: "发现详情",
    riskDescription: "风险描述",
    severity: "严重度",
    category: "类别",
    sourceModel: "来源模型",
    status: "状态",
    attackVector: "攻击向量",
    defense: "防御措施",
    auc: "AUC",
    asr: "ASR",
    tpr: "TPR",
    qualityCost: "质量代价",
    evidenceLevel: "证据等级",
    boundary: "边界",
    close: "关闭",
    high: "高",
    medium: "中",
    low: "低",
    hasDefenseStatus: "已有防御",
    monitoring: "监控中",
    investigating: "调查中",
    noDefense: "无",
    relatedAudit: "相关审计",
    viewReport: "查看报告",
    copyLink: "复制链接",
    linkCopied: "已复制！",
    sourcePath: "来源路径",
    reAudit: "重新审计",
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const CATEGORY_MAP: Record<string, Record<string, string>> = {
  "en-US": {
    "black-box": "Privacy Leakage",
    "gray-box": "Data Exposure",
    "white-box": "Prompt Security",
    other: "Safety Bypass",
  },
  "zh-CN": {
    "black-box": "隐私泄露",
    "gray-box": "数据暴露",
    "white-box": "提示安全",
    other: "安全绕过",
  },
};

function getCategory(track: string, locale: string): string {
  const map = CATEGORY_MAP[locale] ?? CATEGORY_MAP["en-US"];
  return map[track] ?? track;
}

function getStatus(defense: string, riskLevel: string): string {
  if (defense !== "none") return "has-defense";
  if (riskLevel === "high") return "investigating";
  return "monitoring";
}

const RISK_NOTE_ZH: Record<string, string> = {
  "Photoreal face generations show stronger memorization on member portraits.":
    "人脸生成模型对成员肖像表现出更强的记忆效应。",
  "White-box gradients expose memorized waveform fragments without mitigation.":
    "白盒梯度暴露了未缓解的记忆波形片段。",
  "Black-box membership inference via loss deviation. High AUC indicates significant leakage.":
    "基于损失偏差的黑盒成员推断攻击。高 AUC 表明存在显著泄露。",
  "Gray-box posterior deviation attack. High ASR shows gradient leakage is exploitable.":
    "灰盒后验偏差攻击。高 ASR 表明梯度泄露可被利用。",
  "Rare-class lesion samples remain highly vulnerable to posterior attacks.":
    "罕见类病变样本对后验攻击仍然高度脆弱。",
  "Stochastic dropout at all steps reduces ASR by ~15pp with moderate overhead.":
    "全步骤随机丢弃将 ASR 降低约 15 个百分点，开销适中。",
  "Lower AUC on PixelArt suggests stronger baseline privacy.":
    "PixelArt 上较低的 AUC 表明基线隐私保护更强。",
  "Gradient leakage present but lower magnitude than SD v1.4.":
    "存在梯度泄露但幅度低于 SD v1.4。",
  "SMP-LoRA shows stronger mitigation under gray-box attack.":
    "SMP-LoRA 在灰盒攻击下表现出更强的缓解效果。",
  "Clip-guided sanitization lowers leakage while keeping prompt fidelity acceptable.":
    "Clip 引导的净化降低了泄露，同时保持提示保真度在可接受水平。",
};

function getRiskDescription(attack: string, note: string, locale: string): string {
  if (note && note.length > 10) {
    if (locale === "zh-CN" && RISK_NOTE_ZH[note]) {
      return RISK_NOTE_ZH[note];
    }
    return note;
  }
  return attack;
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
  const copy = DETAIL_COPY[locale] ?? DETAIL_COPY["en-US"];
  const panelRef = useRef<HTMLDivElement>(null);
  const [linkCopied, setLinkCopied] = useState(false);

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

  /* Close on Escape + focus restoration */
  useEffect(() => {
    if (!finding) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
      previousFocus?.focus();
    };
  }, [finding, onClose]);

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
        onClick={onClose}
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
              <span>{getCategory(finding.track, locale)}</span>
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
                    <ShieldCheck size={14} strokeWidth={1.5} className="text-[color:var(--success)]" />
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
              <DetailRow label={copy.auc}>
                <span className={`mono text-[12px] ${parseFloat(finding.aucLabel) > 0.85 ? "text-[color:var(--risk-high)] font-medium" : parseFloat(finding.aucLabel) > 0.7 ? "text-[color:var(--warning)]" : ""}`}>{finding.aucLabel}</span>
              </DetailRow>
            )}

            {finding.asrLabel && finding.asrLabel !== "n/a" && (
              <DetailRow label={copy.asr}>
                <span className={`mono text-[12px] ${parseFloat(finding.asrLabel) > 0.5 ? "text-[color:var(--risk-high)] font-medium" : parseFloat(finding.asrLabel) > 0.3 ? "text-[color:var(--warning)]" : ""}`}>{finding.asrLabel}</span>
              </DetailRow>
            )}

            {finding.tprLabel && finding.tprLabel !== "n/a" && (
              <DetailRow label={copy.tpr}>
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
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--accent-blue)] transition-colors hover:text-foreground"
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
