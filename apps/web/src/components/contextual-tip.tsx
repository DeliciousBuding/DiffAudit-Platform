"use client";

import { useSyncExternalStore } from "react";
import { Lightbulb } from "lucide-react";

const DISMISSED_KEY = "diffaudit-dismissed-tips";
const DISMISSED_EVENT = "diffaudit-dismissed-tips-change";

function getDismissedTips(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function dismissTip(id: string) {
  try {
    const dismissed = getDismissedTips();
    dismissed.push(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
    window.dispatchEvent(new Event(DISMISSED_EVENT));
  } catch {
    // localStorage may be unavailable
  }
}

function subscribeToDismissedTips(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DISMISSED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DISMISSED_EVENT, onStoreChange);
  };
}

export function ContextualTip({
  id,
  children,
  locale,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  locale?: string;
  className?: string;
}) {
  const visible = useSyncExternalStore(
    subscribeToDismissedTips,
    () => !getDismissedTips().includes(id),
    () => true,
  );

  if (!visible) return null;

  const dismissLabel = locale === "zh-CN" ? "知道了" : "Got it";

  return (
    <div className={`contextual-tip-enter flex items-start gap-2.5 rounded-2xl border border-[var(--accent-blue)]/20 bg-[var(--accent-blue)]/[0.04] px-4 py-3 text-[13px] leading-5 text-muted-foreground sm:items-center ${className}`.trim()}>
      <Lightbulb size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[var(--accent-blue)] sm:mt-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">{children}</div>
      <button
        type="button"
        onClick={() => {
          dismissTip(id);
        }}
        className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--accent-blue)] transition-colors hover:bg-[var(--accent-blue)]/10"
        aria-label={dismissLabel}
      >
        {dismissLabel}
      </button>
    </div>
  );
}
