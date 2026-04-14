"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/components/language-picker";
import { getStoredLocale } from "@/components/language-picker";
import type { DocsContent, DocsPage, DocsSection } from "./docs-data";
import { getDocsContent, getDocsPage } from "./docs-data";

type DocsHomeProps = {
  loggedIn: boolean;
};

export function DocsHome({ loggedIn }: DocsHomeProps) {
  const [locale, setLocale] = useState<Locale>("en-US");

  useEffect(() => {
    setLocale(getStoredLocale());
  }, []);

  const content = getDocsContent(locale);
  const [selectedSlug, setSelectedSlug] = useState(content.pages[0]?.slug ?? "");
  const page = getDocsPage(content, selectedSlug);

  return (
    <DocsLayout
      content={content}
      page={page}
      selectedSlug={selectedSlug}
      onSelectSlug={setSelectedSlug}
      loggedIn={loggedIn}
    />
  );
}

type DocsLayoutProps = {
  content: DocsContent;
  page: DocsPage | null;
  selectedSlug: string;
  onSelectSlug: (slug: string) => void;
  loggedIn: boolean;
};

function DocsLayout({ content, page, selectedSlug, onSelectSlug, loggedIn }: DocsLayoutProps) {
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
