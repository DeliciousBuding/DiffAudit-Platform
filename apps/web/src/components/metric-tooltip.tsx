"use client";

import { useState, useRef, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Metric term definitions (bilingual)                                */
/* ------------------------------------------------------------------ */

export type MetricTerm = "auc" | "asr" | "tpr" | "fpr" | "roc";

const METRIC_DEFINITIONS: Record<MetricTerm, {
  en: { name: string; short: string; detail: string; goodDirection: string };
  zh: { name: string; short: string; detail: string; goodDirection: string };
}> = {
  auc: {
    en: {
      name: "Area Under the ROC Curve",
      short: "Measures attack success: 0.5 = random guess, 1.0 = perfect attack.",
      detail: "AUC quantifies how well an attacker can distinguish member from non-member data. Higher AUC means the model leaks more information about its training set.",
      goodDirection: "Lower is better (less leakage)",
    },
    zh: {
      name: "ROC 曲线下面积",
      short: "衡量攻击成功率：0.5 = 随机猜测，1.0 = 完美攻击。",
      detail: "AUC 量化了攻击者区分成员与非成员数据的能力。AUC 越高，模型泄露的训练集信息越多。",
      goodDirection: "越低越好（泄露更少）",
    },
  },
  asr: {
    en: {
      name: "Attack Success Rate",
      short: "Percentage of attacks that successfully extract private data.",
      detail: "ASR measures the fraction of targeted samples where the attacker successfully recovers private training information. A 60% ASR means 6 out of 10 targeted samples were compromised.",
      goodDirection: "Lower is better (fewer breaches)",
    },
    zh: {
      name: "攻击成功率",
      short: "成功提取隐私数据的攻击百分比。",
      detail: "ASR 衡量攻击者成功恢复私密训练信息的目标样本比例。60% 的 ASR 意味着 10 个目标样本中有 6 个被攻破。",
      goodDirection: "越低越好（泄露更少）",
    },
  },
  tpr: {
    en: {
      name: "True Positive Rate at 1% FPR",
      short: "Detection rate when false alarm is kept under 1%.",
      detail: "TPR@1% measures how many actual attacks are caught while keeping false positives extremely low (1%). This is critical in production where false alarms are costly.",
      goodDirection: "Higher is better for defenders",
    },
    zh: {
      name: "1% 误报率下的真阳性率",
      short: "在假阳性率控制在 1% 以下时的检测率。",
      detail: "TPR@1% 衡量在假阳性极低（1%）的情况下能捕获多少真实攻击。这在假阳性代价高昂的生产环境中至关重要。",
      goodDirection: "对防御方来说越高越好",
    },
  },
  fpr: {
    en: {
      name: "False Positive Rate",
      short: "Percentage of non-member samples incorrectly flagged as members.",
      detail: "FPR measures how often the attacker's classifier mistakes non-member data for member data. A low FPR with high TPR indicates a strong attack.",
      goodDirection: "Context-dependent",
    },
    zh: {
      name: "假阳性率",
      short: "被错误标记为成员的非成员样本百分比。",
      detail: "FPR 衡量攻击者分类器将非成员数据误判为成员数据的频率。低 FPR 配合高 TPR 表明攻击很强。",
      goodDirection: "视上下文而定",
    },
  },
  roc: {
    en: {
      name: "Receiver Operating Characteristic Curve",
      short: "Plots true positive rate vs false positive rate at all thresholds.",
      detail: "The ROC curve visualizes the tradeoff between catching real attacks (TPR) and raising false alarms (FPR). A curve closer to the top-left corner indicates better attack performance.",
      goodDirection: "Curve closer to top-left = stronger attack",
    },
    zh: {
      name: "受试者工作特征曲线",
      short: "在所有阈值下绘制真阳性率与假阳性率的关系。",
      detail: "ROC 曲线展示了捕获真实攻击（TPR）与产生假阳性（FPR）之间的权衡。曲线越靠近左上角，攻击性能越强。",
      goodDirection: "曲线越靠近左上角 = 攻击越强",
    },
  },
};

/* ------------------------------------------------------------------ */
/*  MetricTooltip component                                            */
/* ------------------------------------------------------------------ */

type MetricTooltipProps = {
  /** The metric term key */
  term: MetricTerm;
  /** The display text (e.g., "AUC", "ASR", "TPR@1%") */
  children: ReactNode;
  /** Locale for display */
  locale?: "en-US" | "zh-CN";
  /** Show as inline icon trigger vs wrapping the text */
  mode?: "wrap" | "icon";
  className?: string;
};

export function MetricTooltip({
  term,
  children,
  locale = "en-US",
  mode = "wrap",
  className,
}: MetricTooltipProps) {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const def = METRIC_DEFINITIONS[term];
  const text = locale === "zh-CN" ? def.zh : def.en;

  useEffect(() => {
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  function updatePosition() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 10;
    // Position below the trigger, centered horizontally
    let top = rect.bottom + gap;
    let left = rect.left + rect.width / 2;

    // Clamp to viewport
    const tooltipWidth = 320;
    const viewportWidth = window.innerWidth;
    if (left - tooltipWidth / 2 < 8) {
      left = tooltipWidth / 2 + 8;
    } else if (left + tooltipWidth / 2 > viewportWidth - 8) {
      left = viewportWidth - tooltipWidth / 2 - 8;
    }

    // If tooltip would go below viewport, show above
    if (top + 200 > window.innerHeight) {
      top = rect.top - gap;
      setPos({ top, left });
      return { above: true };
    }

    setPos({ top, left });
    return { above: false };
  }

  function handleEnter() {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    showTimer.current = setTimeout(() => {
      updatePosition();
      setVisible(true);
    }, 150);
  }

  function handleLeave() {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    hideTimer.current = setTimeout(() => {
      setVisible(false);
    }, 100);
  }

  const tooltipElement = visible ? (
    <div
      ref={tooltipRef}
      className="pointer-events-none fixed z-[200]"
      style={{ top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
      role="tooltip"
    >
      <div className="w-[320px] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-4 shadow-xl"
        style={{ animation: "metric-tooltip-in 0.15s ease-out forwards" }}
      >
        {/* Term name */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
            <Info size={12} strokeWidth={2} />
          </span>
          <span className="text-xs font-bold text-foreground">{text.name}</span>
        </div>
        {/* Short explanation */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{text.short}</p>
        {/* Detailed explanation */}
        <p className="text-[11px] text-muted-foreground/80 leading-relaxed mb-2.5">{text.detail}</p>
        {/* Good direction indicator */}
        <div className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-2.5 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {locale === "zh-CN" ? "方向" : "Direction"}
          </span>
          <span className="text-[11px] font-medium text-foreground">{text.goodDirection}</span>
        </div>
      </div>
      <style>{`
        @keyframes metric-tooltip-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  ) : null;

  if (mode === "icon") {
    return (
      <>
        <span
          ref={triggerRef}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onFocus={handleEnter}
          onBlur={handleLeave}
          className={`inline-flex items-center cursor-help text-muted-foreground/50 hover:text-muted-foreground transition-colors ${className ?? ""}`}
          tabIndex={0}
          aria-label={text.name}
        >
          <Info size={13} strokeWidth={1.5} />
        </span>
        {mounted && typeof document !== "undefined"
          ? createPortal(tooltipElement, document.body)
          : null}
      </>
    );
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        className={`inline-flex items-center gap-1 cursor-help border-b border-dashed border-muted-foreground/30 transition-colors hover:border-muted-foreground/60 ${className ?? ""}`}
        tabIndex={0}
        aria-label={text.name}
      >
        {children}
      </span>
      {mounted && typeof document !== "undefined"
        ? createPortal(tooltipElement, document.body)
        : null}
    </>
  );
}
