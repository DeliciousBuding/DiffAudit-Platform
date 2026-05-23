"use client";
import { useState, useSyncExternalStore } from "react";
import { Copy, Check } from "lucide-react";

import { useToast } from "@/components/toast-provider";
import { getStoredLocale, type Locale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
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
      toast({ type: "success", title: copy.copiedLabel });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      toast({ type: "success", title: copy.copiedLabel });
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      aria-label={copied ? copy.copiedLabel : `${copy.copyLabel} ${label ?? text}`}
    >
      {copied ? (
        <Check size={12} strokeWidth={1.5} className="text-[var(--success)]" />
      ) : (
        <Copy size={12} strokeWidth={1.5} />
      )}
    </button>
  );
}
