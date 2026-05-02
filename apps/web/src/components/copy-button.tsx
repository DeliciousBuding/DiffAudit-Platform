"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

import { useToast } from "@/components/toast-provider";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      const isZh = typeof navigator !== "undefined" && navigator.language.startsWith("zh");
      toast({ type: "success", title: isZh ? "已复制" : "Copied" });
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
      const isZh = typeof navigator !== "undefined" && navigator.language.startsWith("zh");
      toast({ type: "success", title: isZh ? "已复制" : "Copied" });
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      aria-label={copied ? "Copied" : `Copy ${label ?? text}`}
    >
      {copied ? (
        <Check size={12} strokeWidth={1.5} className="text-[var(--success)]" />
      ) : (
        <Copy size={12} strokeWidth={1.5} />
      )}
    </button>
  );
}
