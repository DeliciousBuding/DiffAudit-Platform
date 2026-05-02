"use client";

import { useState, useRef, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  InfoTooltip — lightweight contextual help for technical terms       */
/* ------------------------------------------------------------------ */

type InfoTooltipProps = {
  /** Brief explanation text shown on hover/focus */
  content: string;
  /** Optional label text rendered before the info icon */
  children?: ReactNode;
  className?: string;
};

export function InfoTooltip({ content, children, className }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  function updatePosition() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;
    let top = rect.bottom + gap;
    let left = rect.left + rect.width / 2;

    // Clamp to viewport
    const tooltipWidth = 280;
    const viewportWidth = window.innerWidth;
    if (left - tooltipWidth / 2 < 8) {
      left = tooltipWidth / 2 + 8;
    } else if (left + tooltipWidth / 2 > viewportWidth - 8) {
      left = viewportWidth - tooltipWidth / 2 - 8;
    }

    // Show above if would overflow below
    if (top + 120 > window.innerHeight) {
      top = rect.top - gap;
    }

    setPos({ top, left });
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
      className="pointer-events-none fixed z-[200]"
      style={{ top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
      role="tooltip"
    >
      <div
        className="max-w-[280px] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-3 py-2 text-xs text-muted-foreground leading-relaxed shadow-xl"
        style={{ animation: "info-tooltip-in 0.15s ease-out forwards" }}
      >
        {content}
      </div>
      <style>{`
        @keyframes info-tooltip-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        className={`inline-flex items-center gap-1 ${className ?? ""}`}
      >
        {children}
        <span
          className="inline-flex items-center text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-help"
          tabIndex={0}
          aria-label={content}
        >
          <Info size={13} strokeWidth={1.5} />
        </span>
      </span>
      {mounted && typeof document !== "undefined"
        ? createPortal(tooltipElement, document.body)
        : null}
    </>
  );
}
