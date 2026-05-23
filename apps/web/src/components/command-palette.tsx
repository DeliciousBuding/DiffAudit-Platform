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
import { getNavItems } from "@/lib/navigation";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { type WorkspaceNavIcon } from "@/lib/workspace-registry";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type CommandCategory = "navigation" | "actions" | "info";
type CommandGroupCategory = CommandCategory | "recent";

export interface CommandItem {
  id: string;
  label: string;
  category: CommandCategory;
  icon: LucideIcon;
  href?: string;
  shortcut?: string;
  searchText?: string;
  action: (router: ReturnType<typeof useRouter>, toast: ReturnType<typeof useToast>["toast"], locale: Locale) => void;
}

/* -------------------------------------------------------------------------- */
/*  Command definitions                                                       */
/* -------------------------------------------------------------------------- */

const NAV_ICON_COMPONENTS: Record<WorkspaceNavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  spark: ClipboardList,
  model: Database,
  risk: ShieldAlert,
  report: FileBarChart,
  key: Key,
  account: User,
  settings: Settings,
};

export function getNavigationCommandId(key: string): string {
  return `nav-${key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`;
}

export function getCommandItems(locale: Locale): CommandItem[] {
  const copy = WORKSPACE_COPY[locale].commandPalette;
  const navigationCommands = getNavItems(locale).map((item): CommandItem => ({
    id: getNavigationCommandId(item.key),
    label: item.title,
    category: "navigation",
    icon: NAV_ICON_COMPONENTS[item.icon],
    href: item.href,
    shortcut: item.shortcut,
    searchText: `${item.title} ${item.shortLabel} ${item.subtitle} ${item.href}`,
    action: (router) => router.push(item.href),
  }));

  return [
    ...navigationCommands,
    {
      id: "action-new-task",
      label: copy.actionNewTask,
      category: "actions",
      icon: Plus,
      href: "/workspace/audits/new",
      shortcut: "Ctrl+N",
      action: (router) => router.push("/workspace/audits/new"),
    },
    {
      id: "action-add-model",
      label: copy.actionAddModel,
      category: "actions",
      icon: Upload,
      href: "/workspace/model-assets?add=true",
      action: (router) => router.push("/workspace/model-assets?add=true"),
    },
    {
      id: "action-export-report",
      label: copy.actionExportReport,
      category: "actions",
      icon: FileText,
      href: "/workspace/reports",
      action: (router) => router.push("/workspace/reports"),
    },
    {
      id: "info-shortcuts",
      label: copy.infoShortcuts,
      category: "info",
      icon: Keyboard,
      action: () => {
        window.dispatchEvent(new CustomEvent("workspace:show-shortcuts"));
      },
    },
    {
      id: "info-docs",
      label: copy.infoDocs,
      category: "info",
      icon: BookOpen,
      href: "/docs",
      action: (router) => router.push("/docs"),
    },
  ];
}

const RECENT_KEY = "diffaudit-recent-commands";
const MAX_RECENT = 5;

function getRecentCommandIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentCommand(id: string) {
  try {
    const recent = getRecentCommandIds().filter((c) => c !== id);
    recent.unshift(id);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // localStorage may be unavailable
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function CommandPalette({ locale }: { locale: Locale }) {
  const router = useRouter();
  const { toast } = useToast();
  const copy = WORKSPACE_COPY[locale].commandPalette;
  const commands = useMemo(() => getCommandItems(locale), [locale]);
  const categoryLabels: Record<CommandGroupCategory, string> = useMemo(() => ({
    recent: copy.groupRecent,
    navigation: copy.groupNavigation,
    actions: copy.groupActions,
    info: copy.groupInfo,
  }), [copy]);

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
      ? commands.filter((cmd) => {
          const text = `${cmd.label} ${cmd.searchText ?? ""}`.toLowerCase();
          return text.includes(normalized);
        })
      : commands;

    // When no query, show recent commands first
    if (!normalized) {
      const recentIds = getRecentCommandIds();
      const recentCmds = recentIds
        .map((id) => commands.find((c) => c.id === id))
        .filter(Boolean) as CommandItem[];
      const remaining = commands.filter((c) => !recentIds.includes(c.id));

      const groups: Array<{ category: CommandGroupCategory; items: CommandItem[] }> = [];
      if (recentCmds.length > 0) {
        groups.push({ category: "recent", items: recentCmds });
      }
      const catGroups: Record<CommandCategory, CommandItem[]> = {
        navigation: [],
        actions: [],
        info: [],
      };
      for (const cmd of remaining) {
        catGroups[cmd.category].push(cmd);
      }
      for (const cat of ["navigation", "actions", "info"] as const) {
        if (catGroups[cat].length > 0) {
          groups.push({ category: cat, items: catGroups[cat] });
        }
      }
      return groups;
    }

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
  }, [commands, query]);

  const flatItems = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups],
  );

  /* ---- Open / close ---- */

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
    addRecentCommand(cmd.id);
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

  // Pre-compute flat index offsets per group to avoid mutable counter in render
  const groupOffsets: number[] = [];
  let offset = 0;
  for (const g of filteredGroups) {
    groupOffsets.push(offset);
    offset += g.items.length;
  }

  return (
    <div
      className="command-palette-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={copy.ariaLabel}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePalette();
      }}
    >
      <div className="command-palette" style={{ animation: "modal-content-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
        {/* Search input */}
        <div className="command-palette-search">
          <Search className="command-palette-search-icon" strokeWidth={1.5} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder={copy.placeholder}
            aria-label={copy.searchInputLabel}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-listbox"
            aria-activedescendant={flatItems[activeIndex] ? `cmd-${flatItems[activeIndex].id}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
          />
          <kbd className="command-palette-kbd">ESC</kbd>
        </div>

        {/* Command list */}
        <div className="command-palette-list" ref={listRef} role="listbox" id="command-listbox">
          {flatItems.length === 0 ? (
            <div className="command-palette-empty">
              {copy.noResults}
            </div>
          ) : (
            filteredGroups.map((group, groupIdx) => (
              <div key={group.category} role="group" aria-label={categoryLabels[group.category]}>
                <div className="command-palette-group-header">
                  {categoryLabels[group.category]}
                </div>
                {group.items.map((cmd, localIdx) => {
                  const idx = groupOffsets[groupIdx] + localIdx;
                  const isActive = idx === activeIndex;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      id={`cmd-${cmd.id}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      data-active={isActive}
                      className={`command-palette-item${isActive ? " command-palette-item--active" : ""}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => execute(cmd)}
                    >
                      <Icon className="command-palette-item-icon" strokeWidth={1.5} aria-hidden="true" />
                      <span className="command-palette-item-label">
                        {cmd.label}
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
