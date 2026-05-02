"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { type Locale } from "@/components/language-picker";

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{ keys: string; label: string }>;
}

function getShortcutGroups(locale: Locale): ShortcutGroup[] {
  const isZh = locale === "zh-CN";
  return [
    {
      title: isZh ? "导航" : "Navigation",
      shortcuts: [
        { keys: "Ctrl + K", label: isZh ? "打开命令面板" : "Open command palette" },
        { keys: "Ctrl + 1", label: isZh ? "工作台总览" : "Dashboard" },
        { keys: "Ctrl + 2", label: isZh ? "审计任务" : "Audits" },
        { keys: "Ctrl + 3", label: isZh ? "模型资产" : "Model Assets" },
        { keys: "Ctrl + 4", label: isZh ? "风险发现" : "Risk Findings" },
        { keys: "Ctrl + 5", label: isZh ? "报告中心" : "Reports" },
        { keys: "Ctrl + 6", label: isZh ? "API 管理" : "API Keys" },
        { keys: "Ctrl + 7", label: isZh ? "个人账户" : "Account" },
        { keys: "Ctrl + ,", label: isZh ? "系统设置" : "Settings" },
      ],
    },
    {
      title: isZh ? "操作" : "Actions",
      shortcuts: [
        { keys: "Ctrl + N", label: isZh ? "创建新任务" : "Create new task" },
        { keys: "Ctrl + B", label: isZh ? "折叠/展开侧栏" : "Toggle sidebar" },
      ],
    },
    {
      title: isZh ? "通用" : "General",
      shortcuts: [
        { keys: "?", label: isZh ? "显示快捷键" : "Show shortcuts" },
        { keys: "Esc", label: isZh ? "关闭弹窗" : "Close dialog" },
      ],
    },
  ];
}

export function KeyboardShortcutsModal({
  locale,
  open,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const groups = getShortcutGroups(locale);
  const isZh = locale === "zh-CN";

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
      aria-label={isZh ? "快捷键" : "Keyboard shortcuts"}
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
            {isZh ? "键盘快捷键" : "Keyboard Shortcuts"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted/40 transition-colors"
            aria-label={isZh ? "关闭" : "Close"}
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
            {isZh ? "按 ? 随时查看快捷键" : "Press ? anytime to view shortcuts"}
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
