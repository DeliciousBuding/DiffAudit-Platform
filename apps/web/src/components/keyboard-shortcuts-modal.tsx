"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { getWorkspaceShortcutGroups } from "@/lib/workspace-shortcuts";

export function KeyboardShortcutsModal({
  locale,
  open,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const copy = WORKSPACE_COPY[locale].keyboardShortcuts;
  const groups = getWorkspaceShortcutGroups(locale);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="command-palette-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={copy.ariaLabel}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="command-palette"
        style={{
          maxWidth: "520px",
          animation: "modal-content-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-[13px] font-bold text-foreground">
            {copy.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted/40 transition-colors"
            aria-label={copy.closeLabel}
          >
            <X size={16} strokeWidth={1.5} className="text-muted-foreground" />
          </button>
        </div>

        {/* Groups */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {groups.map((group) => (
            <div key={group.title}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.shortcuts.map((s) => (
                  <div
                    key={s.keys}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <span className="text-[13px] text-foreground">{s.label}</span>
                    <kbd className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/40 border border-border text-[11px] mono text-muted-foreground">
                      {s.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-3 border-t border-border text-center">
          <span className="text-[11px] text-muted-foreground/60">
            {copy.footerHint}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Hook to manage keyboard shortcuts modal state */
export function useKeyboardShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't trigger in inputs
      const el = e.target as HTMLElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) {
        return;
      }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return { open, close: () => setOpen(false) };
}
