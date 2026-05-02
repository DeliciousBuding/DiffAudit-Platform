"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";

const DISMISSED_KEY = "diffaudit-dismissed-tips";

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
  } catch {
    // localStorage may be unavailable
  }
}

export function ContextualTip({
  id,
  children,
  locale,
}: {
  id: string;
  children: React.ReactNode;
  locale?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!getDismissedTips().includes(id));
  }, [id]);

  if (!visible) return null;

  const dismissLabel = locale === "zh-CN" ? "知道了" : "Got it";

  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-[color:var(--accent-blue)]/20 bg-[color:var(--accent-blue)]/[0.04] px-4 py-3 text-[13px] leading-5 text-muted-foreground">
      <Lightbulb size={16} strokeWidth={1.5} className="shrink-0 mt-0.5 text-[color:var(--accent-blue)]" aria-hidden="true" />
      <div className="flex-1 min-w-0">{children}</div>
      <button
        type="button"
        onClick={() => {
          dismissTip(id);
          setVisible(false);
        }}
        className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-[color:var(--accent-blue)] transition-colors hover:bg-[color:var(--accent-blue)]/10"
        aria-label={dismissLabel}
      >
        {dismissLabel}
      </button>
    </div>
  );
}
