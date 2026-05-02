"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { WORKSPACE_NAV_REGISTRY } from "@/lib/workspace-registry";
import { useToast } from "@/components/toast-provider";

/**
 * Global keyboard shortcuts for the workspace.
 *
 * Shortcuts:
 *   Ctrl+K  — Command palette (handled by CommandPalette)
 *   Ctrl+N  — New audit task
 *   Ctrl+1..8 — Navigate to sidebar items
 *   Ctrl+,  — Settings
 *   ?       — Show shortcuts help (when not in input)
 */
export function WorkspaceKeyboardShortcuts({ locale }: { locale?: string }) {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    function isInputElement(el: EventTarget | null): boolean {
      if (!el || !(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        el.isContentEditable
      );
    }

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;

      // Ctrl+N: New audit task
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        router.push("/workspace/audits/new");
        return;
      }

      // Ctrl+,: Settings
      if ((event.ctrlKey || event.metaKey) && event.key === ",") {
        event.preventDefault();
        router.push("/workspace/settings");
        return;
      }

      // Ctrl+1..8: Navigate to sidebar items
      if ((event.ctrlKey || event.metaKey) && event.key >= "1" && event.key <= "8") {
        const index = parseInt(event.key, 10) - 1;
        const navItem = WORKSPACE_NAV_REGISTRY[index];
        if (navItem) {
          event.preventDefault();
          router.push(navItem.href);
        }
        return;
      }

      // ?: Show keyboard shortcuts help (only when not in input)
      if (event.key === "?" && !event.ctrlKey && !event.metaKey && !isInputElement(target)) {
        event.preventDefault();
        const isZh = locale === "zh-CN";
        toast({
          type: "info",
          title: isZh
            ? "快捷键: Ctrl+K 命令面板 | Ctrl+N 新建 | Ctrl+1-8 导航 | Ctrl+, 设置"
            : "Shortcuts: Ctrl+K Command Palette | Ctrl+N New | Ctrl+1-8 Navigate | Ctrl+, Settings",
          duration: 5000,
        });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, toast, locale]);

  return null;
}
