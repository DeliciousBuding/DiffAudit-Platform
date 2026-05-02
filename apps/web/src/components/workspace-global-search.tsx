"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { type Locale } from "@/components/language-picker";
import { getNavItems } from "@/lib/navigation";

const SEARCH_ALIASES: Record<string, string> = {
  "/workspace": "工作台 home dashboard overview metrics 总览 指标",
  "/workspace/audits": "审计任务 审计流程 tasks jobs audit run 创建 运行",
  "/workspace/model-assets": "模型资产 model assets catalog contracts datasets versions 模型 资产 合同 数据集 版本",
  "/workspace/risk-findings": "风险发现 risk findings leakage evidence remediation 风险 发现 证据 修复",
  "/workspace/reports": "报告中心 reports export pdf csv 报告 导出",
  "/workspace/api-keys": "api 管理 api management keys tokens credentials 密钥 秘钥 凭证 分发 停用",
  "/workspace/account": "个人账户 account profile login password oauth 账户 登录 密码 个人资料",
};

export function WorkspaceGlobalSearch({ locale }: { locale: Locale }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const items = useMemo(() => {
    const navItems = getNavItems(locale).map((item) => ({
      href: item.href,
      title: item.title,
      subtitle: item.subtitle,
      keywords: `${item.title} ${item.subtitle} ${item.shortLabel} ${SEARCH_ALIASES[item.href] ?? ""}`.toLowerCase(),
    }));
    const extras = locale === "zh-CN"
      ? [
        { href: "/workspace/audits/new", title: "新建审计任务", subtitle: "创建任务", keywords: "新建 审计 任务 create audit" },
        { href: "/workspace/api-keys", title: "API 密钥", subtitle: "访问凭证", keywords: "api key 密钥 凭证 developer" },
        { href: "/docs", title: "Docs", subtitle: "产品文档", keywords: "docs 文档 指南" },
      ]
      : [
        { href: "/workspace/audits/new", title: "New audit task", subtitle: "Create a job", keywords: "new create audit task" },
        { href: "/workspace/api-keys", title: "API Keys", subtitle: "Access credentials", keywords: "api key credential developer" },
        { href: "/docs", title: "Docs", subtitle: "Product documentation", keywords: "docs documentation guide" },
      ];
    return [...navItems, ...extras];
  }, [locale]);
  const placeholder = locale === "zh-CN" ? "搜索模型、任务、报告..." : "Search models, tasks, reports...";
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items.slice(0, 5);
    }
    return items
      .filter((item) => item.keywords.includes(normalized) || item.title.toLowerCase().includes(normalized))
      .slice(0, 6);
  }, [items, query]);

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

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

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
        onKeyDown={(event) => {
          if (event.key === "Enter" && matches[0]) {
            event.preventDefault();
            go(matches[0].href);
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <kbd>Ctrl K</kbd>
      {open ? (
        <div className="workspace-search-menu">
          {matches.length > 0 ? matches.map((item) => (
            <button key={item.href} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => go(item.href)}>
              <span>{item.title}</span>
              <small>{item.subtitle}</small>
            </button>
          )) : (
            <div className="workspace-search-empty">{locale === "zh-CN" ? "没有匹配结果" : "No results"}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
