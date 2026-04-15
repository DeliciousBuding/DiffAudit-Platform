"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/components/language-picker";
import { getStoredLocale } from "@/components/language-picker";
import type { DocsContent, DocsPage, DocsSection } from "./docs-data";
import { getDocsContent, getDocsPage } from "./docs-data";
import { Tabs, TabPanel } from "@/components/tabs";
import { DocsSearch } from "@/components/docs-search";

type DocsHomeProps = {
  loggedIn: boolean;
  initialSlug?: string;
};

export function DocsHome({ loggedIn, initialSlug }: DocsHomeProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en-US");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setLocale(getStoredLocale());
    // Read initial theme from stored preference or system
    const stored = localStorage.getItem("diffaudit-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored === "dark" || (!stored && prefersDark));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("diffaudit-theme", dark ? "dark" : "light");
  }, [dark]);

  const content = getDocsContent(locale);
  const [selectedSlug, setSelectedSlug] = useState(initialSlug ?? content.pages[0]?.slug ?? "");
  const page = getDocsPage(content, selectedSlug);

  // Find prev/next page for navigation — 2.3.6
  const currentPageIndex = content.pages.findIndex((p) => p.slug === selectedSlug);
  const prevPage = currentPageIndex > 0 ? content.pages[currentPageIndex - 1] : null;
  const nextPage = currentPageIndex < content.pages.length - 1 ? content.pages[currentPageIndex + 1] : null;

  // Compute active group tab from current page — 2.3.3
  const activeGroupTab = page?.group ?? content.groups[0] ?? "";
  const groupTabs = content.groups.map((g) => ({
    value: g,
    label: g,
  }));

  // Get pages for the active group
  const groupPages = content.pages.filter((p) => p.group === activeGroupTab);

  // Navigate via Next.js router — 2.3.2
  const handleSelectSlug = useCallback((slug: string) => {
    setSelectedSlug(slug);
    router.push(`/docs/${slug}`);
  }, [router]);

  function handleGroupChange(groupValue: string) {
    const firstPageInGroup = content.pages.find((p) => p.group === groupValue);
    if (firstPageInGroup) {
      setSelectedSlug(firstPageInGroup.slug);
    }
  }

  return (
    <DocsLayout
      content={content}
      page={page}
      selectedSlug={selectedSlug}
      onSelectSlug={handleSelectSlug}
      loggedIn={loggedIn}
      prevPage={prevPage}
      nextPage={nextPage}
      groupTabs={groupTabs}
      activeGroupTab={activeGroupTab}
      onGroupChange={handleGroupChange}
      groupPages={groupPages}
      locale={locale}
      dark={dark}
      setDark={setDark}
    />
  );
}

type DocsLayoutProps = {
  content: DocsContent;
  page: DocsPage | null;
  selectedSlug: string;
  onSelectSlug: (slug: string) => void;
  loggedIn: boolean;
  prevPage: DocsPage | null;
  nextPage: DocsPage | null;
};

function DocsLayout({ content, page, selectedSlug, onSelectSlug, loggedIn, prevPage, nextPage, groupTabs, activeGroupTab, onGroupChange, groupPages, locale, dark, setDark }: DocsLayoutProps & {
  groupTabs: Array<{ value: string; label: string }>;
  activeGroupTab: string;
  onGroupChange: (value: string) => void;
  groupPages: DocsPage[];
  locale: Locale;
  dark: boolean;
  setDark: (v: boolean) => void;
}) {
  // Group pages by their group
  const groupedPages = new Map<string, DocsPage[]>();
  for (const p of content.pages) {
    const existing = groupedPages.get(p.group) ?? [];
    existing.push(p);
    groupedPages.set(p.group, existing);
  }

  // Flatten groups into a list with group headers
  type NavItem =
    | { type: "group"; label: string }
    | { type: "page"; page: DocsPage };

  const navItems: NavItem[] = [];
  for (const groupIndex of content.groups) {
    const pages = groupedPages.get(groupIndex);
    if (!pages || pages.length === 0) continue;
    navItems.push({ type: "group", label: groupIndex });
    for (const p of pages) {
      navItems.push({ type: "page", page: p });
    }
  }

  // Build TOC from current page sections
  const tocSections = page?.sections ?? [];

  function handleSelectSection(slug: string, sectionId?: string) {
    onSelectSlug(slug);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Topbar */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <a href="/" className="text-sm font-semibold text-[var(--color-text-primary)]">
              DiffAudit
            </a>
            <nav className="hidden gap-4 sm:flex">
              <a href="/" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                {content.header.home}
              </a>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {content.header.docs}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              )}
            </button>
            {/* Search button — 2.3.1 */}
            <button
              onClick={() => {
                const event = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, metaKey: true });
                window.dispatchEvent(event);
              }}
              className="hidden sm:flex items-center gap-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-blue)] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span>{content.header.searchPlaceholder.split("、")[0] || "Search"}</span>
              <kbd className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-1.5 py-0.5 font-mono text-[10px]">
                Ctrl+K
              </kbd>
            </button>
            {!loggedIn && (
              <a href="/login" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                {content.header.signIn}
              </a>
            )}
            {loggedIn && (
              <a href="/workspace" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                {content.header.openWorkspace}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Group tab navigation — 2.3.3 */}
      <div className="sticky top-14 z-40 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-0">
          <Tabs
            value={activeGroupTab}
            onChange={onGroupChange}
            tabs={groupTabs}
            variant="inline"
          />
          {/* Sub-navigation: sections within the current page */}
          {page && page.sections.length > 1 && (
            <div className="hidden md:flex items-center gap-1 text-xs">
              {page.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="px-2 py-2.5 transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                >
                  {section.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main layout: left nav + content + right TOC */}
      <div className="mx-auto flex max-w-7xl">
        {/* Left navigation */}
        <aside className="hidden w-72 shrink-0 border-r border-[var(--color-border-subtle)] lg:block">
          <nav className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
            {navItems.map((item, i) => {
              if (item.type === "group") {
                return (
                  <h3
                    key={i}
                    className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
                  >
                    {item.label}
                  </h3>
                );
              }
              const isActive = item.page.slug === selectedSlug;
              return (
                <button
                  key={item.page.slug}
                  onClick={() => onSelectSlug(item.page.slug)}
                  className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--color-bg-active)] text-[var(--color-text-primary)] font-medium"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
                  }`}
                >
                  {item.page.navLabel}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 px-6 py-8 lg:px-10">
          {page ? (
            <article className="mx-auto max-w-prose">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--color-accent-blue)]">
                {page.eyebrow}
              </p>
              <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)]">
                {page.title}
              </h1>
              <p className="mb-8 text-base text-[var(--color-text-secondary)]">
                {page.summary}
              </p>

              {page.sections.map((section) => (
                <SectionRenderer key={section.id} section={section} />
              ))}

              {/* Edit this page link — 2.3.5 */}
              <div className="mt-8 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-4">
                <a
                  href={`https://github.com/DiffAudit/DiffAudit/edit/main/Platform/apps/web/src/app/(marketing)/docs/docs-data.ts`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  {locale === "zh-CN" ? "在 GitHub 上编辑此页" : "Edit this page on GitHub"}
                </a>
              </div>

              {/* Prev/Next navigation — 2.3.6 */}
              {(prevPage || nextPage) && (
                <div className="mt-12 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-6">
                  {prevPage ? (
                    <button
                      onClick={() => onSelectSlug(prevPage.slug)}
                      className="flex flex-1 items-center gap-3 rounded-lg border border-[var(--color-border-subtle)] p-4 text-left transition-colors hover:border-[var(--color-accent-blue)] hover:bg-[var(--color-bg-hover)]"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                      <div>
                        <div className="text-[10px] text-[var(--color-text-muted)]">{locale === "zh-CN" ? "上一页" : "Previous"}</div>
                        <div className="text-sm font-medium text-[var(--color-text-primary)]">{prevPage.navLabel}</div>
                      </div>
                    </button>
                  ) : <div className="flex-1" />}
                  {nextPage ? (
                    <button
                      onClick={() => onSelectSlug(nextPage.slug)}
                      className="flex flex-1 items-center justify-end gap-3 rounded-lg border border-[var(--color-border-subtle)] p-4 text-right transition-colors hover:border-[var(--color-accent-blue)] hover:bg-[var(--color-bg-hover)]"
                    >
                      <div>
                        <div className="text-[10px] text-[var(--color-text-muted)]">{locale === "zh-CN" ? "下一页" : "Next"}</div>
                        <div className="text-sm font-medium text-[var(--color-text-primary)]">{nextPage.navLabel}</div>
                      </div>
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  ) : <div className="flex-1" />}
                </div>
              )}
            </article>
          ) : (
            <div className="mx-auto max-w-prose text-center py-20">
              <p className="text-lg text-[var(--color-text-muted)]">Page not found</p>
            </div>
          )}
        </main>

        {/* Right TOC */}
        {tocSections.length > 0 && (
          <aside className="hidden w-56 shrink-0 lg:block">
            <nav className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {content.header.utilityLabel}
              </h3>
              <ul className="space-y-1.5">
                {tocSections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>

      {/* Search overlay — 2.3.1 */}
      <DocsSearch locale={locale} onSelect={handleSelectSection} />
    </div>
  );
}

function SectionRenderer({ section }: { section: DocsSection }) {
  const toneMap: Record<string, string> = {
    blue: "border-l-[var(--color-accent-blue)]",
    green: "border-l-[var(--color-accent-green)]",
    amber: "border-l-[var(--color-accent-amber)]",
    coral: "border-l-[var(--color-accent-coral)]",
    neutral: "border-l-[var(--color-border-subtle)]",
  };

  return (
    <section id={section.id} className="mb-10">
      <h2 className="mb-3 text-xl font-semibold text-[var(--color-text-primary)]">
        {section.title}
      </h2>
      {section.paragraphs.map((p, i) => (
        <p key={i} className="mb-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {p}
        </p>
      ))}

      {section.codeBlocks && (
        <div className="mt-4 space-y-4">
          {section.codeBlocks.map((block, i) => (
            <CodeBlock key={i} block={block} />
          ))}
        </div>
      )}

      {section.rows && (
        <div className="mt-4 space-y-3">
          {section.rows.map((row, i) => (
            <div
              key={i}
              className={`rounded-lg border-l-4 bg-[var(--color-bg-secondary)] p-4 ${
                row.tone ? toneMap[row.tone] ?? toneMap.neutral : toneMap.neutral
              }`}
            >
              {row.eyebrow && (
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  {row.eyebrow}
                </p>
              )}
              <h3 className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">
                {row.title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">{row.body}</p>
            </div>
          ))}
        </div>
      )}

      {section.table && (
        <div className="mt-4 overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg-secondary)]">
              <tr>
                {section.table.columns.map((col, i) => (
                  <th
                    key={i}
                    className="px-4 py-2 text-left text-xs font-semibold text-[var(--color-text-primary)]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]"
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-sm text-[var(--color-text-secondary)]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.links && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section.links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className="rounded-lg border border-[var(--color-border-subtle)] p-4 transition-colors hover:border-[var(--color-accent-blue)] hover:bg-[var(--color-bg-hover)]"
            >
              <h3 className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">
                {link.title}
              </h3>
              <p className="mb-3 text-sm text-[var(--color-text-secondary)]">{link.body}</p>
              <span className="text-sm font-medium text-[var(--color-accent-blue)]">
                {link.cta}
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

/** Code block with basic syntax highlighting — 2.3.4 */
function CodeBlock({ block }: { block: { language: string; title?: string; code: string } }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(block.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Basic keyword highlighting for bash/shell
  const highlightedCode = highlightBash(block.code);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
      {block.title && (
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">{block.language}</span>
            <span className="text-xs text-[var(--color-text-muted)]">—</span>
            <span className="text-xs text-[var(--color-text-secondary)]">{block.title}</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code
          className="text-[var(--color-text-primary)]"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
}

/** Minimal bash syntax highlighting via regex replacement */
function highlightBash(code: string): string {
  // Escape HTML entities first
  let s = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Highlight comments
  s = s.replace(/^(#.*)$/gm, '<span class="text-[var(--color-text-muted)]">$1</span>');

  // Highlight strings (single and double quoted)
  s = s.replace(/(&quot;[^&]*&quot;|&#x27;[^&]*&#x27;|"[^"]*"|'[^']*')/g,
    '<span class="text-[var(--color-accent-green)]">$1</span>');

  // Highlight flags (--flag, -f)
  s = s.replace(/(\s|--?)([a-zA-Z][\w-]*)/g,
    '$1<span class="text-[var(--color-accent-amber)]">$2</span>');

  // Highlight URLs
  s = s.replace(/(https?:\/\/[^\s\\]+)/g,
    '<span class="text-[var(--color-accent-blue)] underline">$1</span>');

  // Highlight keywords
  const keywords = ["curl", "jq", "git", "npm", "go", "docker", "python", "node"];
  for (const kw of keywords) {
    const re = new RegExp(`\\b(${kw})\\b`, "g");
    s = s.replace(re, '<span class="text-[var(--color-accent-coral)] font-medium">$1</span>');
  }

  return s;
}
