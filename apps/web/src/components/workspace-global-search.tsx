"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, ArrowRight } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { getNavItems } from "@/lib/navigation";

const SEARCH_ALIASES: Record<string, string> = {
  "/workspace/start": "工作台 home dashboard overview metrics 总览 指标",
  "/workspace/audits": "审计任务 审计流程 tasks jobs audit run 创建 运行",
  "/workspace/model-assets": "模型资产 model assets catalog contracts datasets versions 模型 资产 合同 数据集 版本",
  "/workspace/risk-findings": "风险发现 risk findings leakage evidence remediation 风险 发现 证据 修复",
  "/workspace/reports": "报告中心 reports export pdf csv 报告 导出",
  "/workspace/api-keys": "api 管理 api management keys tokens credentials 密钥 秘钥 凭证 分发 停用",
  "/workspace/account": "个人账户 account profile login password oauth 账户 登录 密码 个人资料",
};

const RECENT_KEY = "diffaudit-recent-pages";
const MAX_RECENT = 3;

function getRecentPages(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentPage(href: string) {
  try {
    const recent = getRecentPages().filter((h) => h !== href);
    recent.unshift(href);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // localStorage may be unavailable
  }
}

export function WorkspaceGlobalSearch({ locale }: { locale: Locale }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => {
    const navItems = getNavItems(locale).map((item) => ({
      href: item.href,
      title: item.title,
      subtitle: item.subtitle,
      keywords: `${item.title} ${item.subtitle} ${item.shortLabel} ${SEARCH_ALIASES[item.href] ?? ""}`.toLowerCase(),
    }));
    const extras = locale === "zh-CN"
      ? [
        { href: "/workspace/api-keys", title: "API 密钥", subtitle: "访问凭证", keywords: "api key 密钥 凭证 developer" },
        { href: "/docs", title: "Docs", subtitle: "产品文档", keywords: "docs 文档 指南" },
      ]
      : [
        { href: "/workspace/api-keys", title: "API Keys", subtitle: "Access credentials", keywords: "api key credential developer" },
        { href: "/docs", title: "Docs", subtitle: "Product documentation", keywords: "docs documentation guide" },
      ];
    return [...navItems, ...extras];
  }, [locale]);

  const placeholder = locale === "zh-CN" ? "搜索页面..." : "Search pages...";
  const noResultsText = locale === "zh-CN" ? "没有匹配结果" : "No results";
  const recentLabel = locale === "zh-CN" ? "最近访问" : "Recent";

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      // Show recent pages first, then fill with defaults
      const recent = getRecentPages();
      const recentItems = recent
        .map((href) => items.find((item) => item.href === href))
        .filter(Boolean) as typeof items;
      const remaining = items.filter((item) => !recent.includes(item.href));
      return [...recentItems, ...remaining].slice(0, 5);
    }
    return items
      .filter((item) => item.keywords.includes(normalized) || item.title.toLowerCase().includes(normalized))
      .slice(0, 6);
  }, [items, query]);

  // Reset active index when matches change
  useEffect(() => {
    setActiveIndex(0);
  }, [matches]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector("[data-search-active=\"true\"]");
    if (active) {
      active.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const go = useCallback((href: string) => {
    setOpen(false);
    setQuery("");
    addRecentPage(href);
    router.push(href);
  }, [router]);

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1 < matches.length ? i + 1 : 0));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => (i - 1 >= 0 ? i - 1 : matches.length - 1));
        break;
      case "Enter":
        event.preventDefault();
        if (matches[activeIndex]) {
          go(matches[activeIndex].href);
        }
        break;
    }
  }

  const isRecent = !query.trim();

  return (
    <div className="workspace-global-search" role="search" onMouseLeave={() => setOpen(false)}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path d="m21 21-4.4-4.4M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-controls="search-listbox"
        aria-activedescendant={open && matches[activeIndex] ? `search-item-${activeIndex}` : undefined}
      />
      <kbd aria-hidden="true">Ctrl K</kbd>
      {open ? (
        <div className="workspace-search-menu" id="search-listbox" ref={listRef} role="listbox">
          {isRecent && (
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
              {recentLabel}
            </div>
          )}
          {matches.length > 0 ? matches.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={item.href}
                id={`search-item-${index}`}
                type="button"
                role="option"
                aria-selected={isActive}
                data-search-active={isActive}
                className={isActive ? "is-active" : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => go(item.href)}
              >
                <span>{item.title}</span>
                <small>{item.subtitle}</small>
              </button>
            );
          }) : (
            <div className="workspace-search-empty">{noResultsText}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
