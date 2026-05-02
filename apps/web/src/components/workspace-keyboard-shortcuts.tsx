"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { WORKSPACE_NAV_REGISTRY } from "@/lib/workspace-registry";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";

/**
 * Global keyboard shortcuts for the workspace.
 *
 * Shortcuts:
 *   Ctrl+K  — Command palette (handled by CommandPalette)
 *   Ctrl+N  — New audit task
 *   Ctrl+B  — Toggle sidebar collapse
 *   Ctrl+1..8 — Navigate to sidebar items
 *   Ctrl+,  — Settings
 *   ?       — Show shortcuts modal (when not in input)
 */
export function WorkspaceKeyboardShortcuts({ locale }: { locale?: string }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    function onShowShortcuts() {
      setModalOpen(true);
    }
    window.addEventListener("workspace:show-shortcuts", onShowShortcuts);
    return () => window.removeEventListener("workspace:show-shortcuts", onShowShortcuts);
  }, []);

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

      // Ctrl+B: Toggle sidebar collapse
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        const toggleFn = (window as Record<string, unknown>).__toggleSidebar;
        if (typeof toggleFn === "function") {
          toggleFn();
        }
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

      // ?: Show keyboard shortcuts modal (only when not in input)
      if (event.key === "?" && !event.ctrlKey && !event.metaKey && !isInputElement(target)) {
        event.preventDefault();
        setModalOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <KeyboardShortcutsModal
      locale={(locale ?? "en-US") as "zh-CN" | "en-US"}
      open={modalOpen}
      onClose={closeModal}
    />
  );
}
