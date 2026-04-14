"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function Modal({ open, onClose, title, children, actions }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ animation: "modal-backdrop-in 0.15s ease-out forwards" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="mx-4 w-full max-w-md rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] shadow-xl"
        style={{ animation: "modal-content-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-4">{children}</div>
        {/* Footer */}
        {actions && (
          <div className="flex justify-end gap-2 border-t border-[var(--color-border-subtle)] px-5 py-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
