"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: TooltipPosition;
  className?: string;
  delayShow?: number;
  delayHide?: number;
}

export function Tooltip({
  children,
  content,
  position = "top",
  className,
  delayShow = 200,
  delayHide = 100,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tooltipRect, setTooltipRect] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;

    switch (position) {
      case "top":
        setTooltipRect({
          top: rect.top - gap,
          left: rect.left + rect.width / 2,
        });
        break;
      case "bottom":
        setTooltipRect({
          top: rect.bottom + gap,
          left: rect.left + rect.width / 2,
        });
        break;
      case "left":
        setTooltipRect({
          top: rect.top + rect.height / 2,
          left: rect.left - gap,
        });
        break;
      case "right":
        setTooltipRect({
          top: rect.top + rect.height / 2,
          left: rect.right + gap,
        });
        break;
    }
  };

  const handleEnter = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    showTimer.current = setTimeout(() => {
      updatePosition();
      setVisible(true);
    }, delayShow);
  };

  const handleLeave = () => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    hideTimer.current = setTimeout(() => {
      setVisible(false);
    }, delayHide);
  };

  const positionClasses: Record<TooltipPosition, string> = {
    top: "-translate-x-1/2 -translate-y-full after:left-1/2 after:-translate-x-1/2 after:top-full after:border-t-[var(--color-bg-primary)] after:border-r-transparent after:border-b-transparent after:border-l-transparent",
    bottom: "-translate-x-1/2 translate-y-0 after:left-1/2 after:-translate-x-1/2 after:bottom-full after:border-t-transparent after:border-r-transparent after:border-b-[var(--color-bg-primary)] after:border-l-transparent",
    left: "-translate-x-full -translate-y-1/2 after:top-1/2 after:-translate-y-1/2 after:left-full after:border-t-transparent after:border-r-[var(--color-bg-primary)] after:border-b-transparent after:border-l-transparent",
    right: "translate-x-0 -translate-y-1/2 after:top-1/2 after:-translate-y-1/2 after:right-full after:border-t-transparent after:border-r-transparent after:border-b-transparent after:border-l-[var(--color-bg-primary)]",
  };

  const tooltipElement = visible ? (
    <div
      className={`pointer-events-none fixed z-[50] ${positionClasses[position]}`}
      style={{
        top: tooltipRect.top,
        left: tooltipRect.left,
      }}
    >
      <div
        className={`relative whitespace-nowrap rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-2.5 py-1.5 text-xs text-[var(--color-text-secondary)] shadow-lg after:absolute after:border-4 after:border-solid ${className ?? ""}`}
        role="tooltip"
      >
        {content}
      </div>
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
        className="inline-flex"
        aria-hidden="true"
      >
        {children}
      </span>
      {mounted && typeof document !== "undefined"
        ? createPortal(tooltipElement, document.body)
        : null}
    </>
  );
}
