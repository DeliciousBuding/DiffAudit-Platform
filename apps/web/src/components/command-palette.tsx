"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Database,
  ShieldAlert,
  FileBarChart,
  Key,
  User,
  Settings,
  Plus,
  Upload,
  FileText,
  Keyboard,
  BookOpen,
  Search,
  type LucideIcon,
} from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { useToast } from "@/components/toast-provider";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type CommandCategory = "navigation" | "actions" | "info";

interface CommandItem {
  id: string;
  label: string;
  labelZh: string;
  category: CommandCategory;
  icon: LucideIcon;
  shortcut?: string;
  action: (router: ReturnType<typeof useRouter>, toast: ReturnType<typeof useToast>["toast"], locale: Locale) => void;
}

/* -------------------------------------------------------------------------- */
/*  Command definitions                                                       */
/* -------------------------------------------------------------------------- */

const COMMANDS: CommandItem[] = [
  // Navigation
  {
    id: "nav-dashboard",
    label: "Go to Dashboard",
    labelZh: "前往工作台",
    category: "navigation",
    icon: LayoutDashboard,
    shortcut: "Ctrl+1",
    action: (router) => router.push("/workspace/start"),
  },
  {
    id: "nav-audits",
    label: "Go to Audits",
    labelZh: "前往审计任务",
    category: "navigation",
    icon: ClipboardList,
    shortcut: "Ctrl+2",
    action: (router) => router.push("/workspace/audits"),
  },
  {
    id: "nav-model-assets",
    label: "Go to Model Assets",
    labelZh: "前往模型资产",
    category: "navigation",
    icon: Database,
    shortcut: "Ctrl+3",
    action: (router) => router.push("/workspace/model-assets"),
  },
  {
    id: "nav-risk-findings",
    label: "Go to Risk Findings",
    labelZh: "前往风险发现",
    category: "navigation",
    icon: ShieldAlert,
    shortcut: "Ctrl+4",
    action: (router) => router.push("/workspace/risk-findings"),
  },
  {
    id: "nav-reports",
    label: "Go to Reports",
    labelZh: "前往报告中心",
    category: "navigation",
    icon: FileBarChart,
    shortcut: "Ctrl+5",
    action: (router) => router.push("/workspace/reports"),
  },
  {
    id: "nav-api-keys",
    label: "Go to API Keys",
    labelZh: "前往 API 管理",
    category: "navigation",
    icon: Key,
    shortcut: "Ctrl+6",
    action: (router) => router.push("/workspace/api-keys"),
  },
  {
    id: "nav-account",
    label: "Go to Account",
    labelZh: "前往个人账户",
    category: "navigation",
    icon: User,
    shortcut: "Ctrl+7",
    action: (router) => router.push("/workspace/account"),
  },
  {
    id: "nav-settings",
    label: "Go to Settings",
    labelZh: "前往系统设置",
    category: "navigation",
    icon: Settings,
    shortcut: "Ctrl+,",
    action: (router) => router.push("/workspace/settings"),
  },
  // Actions
  {
    id: "action-new-task",
    label: "Create New Task",
    labelZh: "创建新任务",
    category: "actions",
    icon: Plus,
    shortcut: "Ctrl+N",
    action: (router) => router.push("/workspace/audits/new"),
  },
  {
    id: "action-add-model",
    label: "Add Model",
    labelZh: "添加模型",
    category: "actions",
    icon: Upload,
    action: (router) => router.push("/workspace/model-assets?add=true"),
  },
  {
    id: "action-export-report",
    label: "Export Report",
    labelZh: "导出报告",
    category: "actions",
    icon: FileText,
    action: (router) => router.push("/workspace/reports"),
  },
  // Info
  {
    id: "info-shortcuts",
    label: "Show Keyboard Shortcuts",
    labelZh: "显示快捷键",
    category: "info",
    icon: Keyboard,
    action: (_router, toast, locale) => {
      const isZh = locale === "zh-CN";
      toast({
        type: "info",
        title: isZh
          ? "快捷键: Ctrl+K 命令面板 | Ctrl+N 新建 | Ctrl+1-8 导航 | Ctrl+, 设置"
          : "Shortcuts: Ctrl+K Command Palette | Ctrl+N New | Ctrl+1-8 Navigate | Ctrl+, Settings",
        duration: 6000,
      });
    },
  },
  {
    id: "info-docs",
    label: "View Documentation",
    labelZh: "查看文档",
    category: "info",
    icon: BookOpen,
    action: (router) => router.push("/docs"),
  },
];

const CATEGORY_LABELS: Record<CommandCategory, { en: string; zh: string }> = {
  navigation: { en: "Navigation", zh: "导航" },
  actions: { en: "Actions", zh: "操作" },
  info: { en: "Info", zh: "信息" },
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function CommandPalette({ locale }: { locale: Locale }) {
  const router = useRouter();
  const { toast } = useToast();
  const isZh = locale === "zh-CN";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /* ---- Filtered + grouped commands ---- */
  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matched = normalized
      ? COMMANDS.filter((cmd) => {
          const text = `${cmd.label} ${cmd.labelZh}`.toLowerCase();
          return text.includes(normalized);
        })
      : COMMANDS;

    const groups: Record<CommandCategory, CommandItem[]> = {
      navigation: [],
      actions: [],
      info: [],
    };
    for (const cmd of matched) {
      groups[cmd.category].push(cmd);
    }
    return (["navigation", "actions", "info"] as const)
      .filter((cat) => groups[cat].length > 0)
      .map((cat) => ({ category: cat, items: groups[cat] }));
  }, [query]);

  const flatItems = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups],
  );

  /* ---- Open / close ---- */
  const openPalette = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    previousFocusRef.current?.focus();
  }, []);

  /* ---- Global Ctrl+K listener ---- */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) {
            // already open — close
            return false;
          }
          previousFocusRef.current = document.activeElement as HTMLElement;
          setQuery("");
          setActiveIndex(0);
          return true;
        });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ---- Focus input when opened ---- */
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  /* ---- Lock body scroll ---- */
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* ---- Reset active index when query changes ---- */
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  /* ---- Scroll active item into view ---- */
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector("[data-active=\"true\"]");
    if (active) {
      active.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  /* ---- Execute a command ---- */
  function execute(cmd: CommandItem) {
    closePalette();
    cmd.action(router, toast, locale);
  }

  /* ---- Keyboard navigation inside palette ---- */
  function onInputKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1 < flatItems.length ? i + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 >= 0 ? i - 1 : flatItems.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (flatItems[activeIndex]) {
          execute(flatItems[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        closePalette();
        break;
    }
  }

  /* ---- Render ---- */
  if (!open) return null;

  let globalIndex = -1;

  return (
    <div
      className="command-palette-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isZh ? "命令面板" : "Command palette"}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePalette();
      }}
    >
      <div className="command-palette" style={{ animation: "modal-content-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
        {/* Search input */}
        <div className="command-palette-search">
          <Search className="command-palette-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder={isZh ? "输入命令..." : "Type a command..."}
            aria-label={isZh ? "搜索命令" : "Search commands"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
          />
          <kbd className="command-palette-kbd">ESC</kbd>
        </div>

        {/* Command list */}
        <div className="command-palette-list" ref={listRef} role="listbox">
          {flatItems.length === 0 ? (
            <div className="command-palette-empty">
              {isZh ? "没有匹配的命令" : "No matching commands"}
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.category} role="group" aria-label={isZh ? CATEGORY_LABELS[group.category].zh : CATEGORY_LABELS[group.category].en}>
                <div className="command-palette-group-header">
                  {isZh ? CATEGORY_LABELS[group.category].zh : CATEGORY_LABELS[group.category].en}
                </div>
                {group.items.map((cmd) => {
                  globalIndex++;
                  const idx = globalIndex;
                  const isActive = idx === activeIndex;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      data-active={isActive}
                      className={`command-palette-item${isActive ? " command-palette-item--active" : ""}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => execute(cmd)}
                    >
                      <Icon className="command-palette-item-icon" aria-hidden="true" />
                      <span className="command-palette-item-label">
                        {isZh ? cmd.labelZh : cmd.label}
                      </span>
                      {cmd.shortcut && (
                        <kbd className="command-palette-kbd">{cmd.shortcut}</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
