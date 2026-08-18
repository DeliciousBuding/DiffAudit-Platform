"use client";

import { useState, useSyncExternalStore } from "react";
import { Copy, Check } from "lucide-react";

import { toast } from "@/components/ui/sonner";
import { getStoredLocale, type Locale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

/**
 * CopyButton — inline 12px copy affordance.
 *
 * Kept as a bare styled <button> (not the Button primitive): the 12px inline
 * icon sits next to content (API keys, model names) where the Button's square
 * icon sizes would break the inline rhythm. Migrated to the direct sonner
 * `toast` import (was `useToast()`).
 */
export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const locale = useSyncExternalStore<Locale>(
    () => () => undefined,
    () => getStoredLocale(),
    () => "en-US",
  );
  const copy = WORKSPACE_COPY[locale].shell;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(copy.copiedLabel);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS / older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success(copy.copiedLabel);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
      aria-label={copied ? copy.copiedLabel : `${copy.copyLabel} ${label ?? text}`}
    >
      {copied ? (
        <Check size={12} strokeWidth={1.5} className="text-success" />
      ) : (
        <Copy size={12} strokeWidth={1.5} />
      )}
    </button>
  );
}
