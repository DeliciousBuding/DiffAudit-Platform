"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { type Locale } from "@/components/language-picker";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import { getWorkspaceNavHrefForShortcutKey } from "@/lib/workspace-shortcuts";

/**
 * Global keyboard shortcuts for the workspace.
 *
 * Shortcuts:
 *   Ctrl+K  — Command palette (handled by CommandPalette)
 *   Ctrl+N  — New audit task
 *   Ctrl+B  — Toggle sidebar collapse
 *   Ctrl+1..7 and Ctrl+, — Navigate to registered workspace items
 *   ?       — Show shortcuts modal (when not in input)
 */
export function WorkspaceKeyboardShortcuts({ locale }: { locale?: string }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const activeLocale: Locale = locale === "zh-CN" ? "zh-CN" : "en-US";

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

      // Ctrl+B is handled by the Sidebar block (SidebarProvider), so it is
      // intentionally not handled here — see components/ui/sidebar.tsx.

      // Ctrl+number/Ctrl+comma: Navigate to registered workspace items.
      if (event.ctrlKey || event.metaKey) {
        const navHref = getWorkspaceNavHrefForShortcutKey(event.key);
        if (navHref) {
          event.preventDefault();
          router.push(navHref);
          return;
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
      locale={activeLocale}
      open={modalOpen}
      onClose={closeModal}
    />
  );
}
