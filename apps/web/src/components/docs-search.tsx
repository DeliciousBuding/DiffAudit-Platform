"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { Locale } from "@/components/language-picker";
import type { DocsContent, DocsPage, DocsSection } from "@/app/(marketing)/docs/docs-data";
import { getDocsContent } from "@/app/(marketing)/docs/docs-data";

interface SearchResult {
  page: DocsPage;
  section: DocsSection | null;
  matchType: "title" | "navLabel" | "section" | "content";
  matchedText: string;
  score: number;
}

interface DocsSearchProps {
  locale: Locale;
  onSelect: (slug: string, sectionId?: string) => void;
}

export function DocsSearch({ locale, onSelect }: DocsSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const content = getDocsContent(locale);

  // Build searchable index
  const index = buildIndex(content);

  // Search on query change - use useMemo instead of state
  const results = useMemo(() => {
    if (query.length < 2) return [];
    return search(index, query);
  }, [query, index]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Reset state when opened
  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Keyboard navigation within results
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        const r = results[selectedIndex];
        onSelect(r.page.slug, r.section?.id);
        setOpen(false);
      }
    },
    [results, selectedIndex, onSelect]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label={content.header.searchPlaceholder}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Search panel */}
      <div className="relative w-full max-w-xl rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border-subtle)] px-4 py-3">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={content.header.searchPlaceholder}
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {query.length >= 2 && (
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                {content.header.searchNoResults} &quot;{query}&quot;
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((r, i) => (
                  <button
                    key={`${r.page.slug}-${r.section?.id ?? ""}-${r.matchType}`}
                    data-index={i}
                    onClick={() => {
                      onSelect(r.page.slug, r.section?.id);
                      setOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full rounded-md px-3 py-2.5 text-left transition-colors ${
                      i === selectedIndex
                        ? "bg-[var(--color-bg-active)]"
                        : "hover:bg-[var(--color-bg-hover)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[var(--color-text-primary)]">
                        {r.page.navLabel}
                      </span>
                      {r.section && (
                        <>
                          <span className="text-[10px] text-[var(--color-text-muted)]">/</span>
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {r.section.label}
                          </span>
                        </>
                      )}
                      <span
                        className={`ml-auto text-[10px] font-medium uppercase tracking-wider ${
                          r.matchType === "title"
                            ? "text-[var(--color-accent-blue)]"
                            : r.matchType === "navLabel"
                            ? "text-[var(--color-accent-green)]"
                            : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {r.matchType}
                      </span>
                    </div>
                    {r.matchedText && (
                      <div className="mt-1 line-clamp-2 text-xs text-[var(--color-text-muted)]">
                        {r.matchedText}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[var(--color-border-subtle)] px-4 py-2 flex items-center gap-4 text-[10px] text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] px-1 py-0.5 font-mono">↑↓</kbd>
            {content.header.searchNavigate}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] px-1 py-0.5 font-mono">↵</kbd>
            {content.header.searchOpen}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] px-1 py-0.5 font-mono">esc</kbd>
            {content.header.searchClose}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Search index ----

interface SearchIndex {
  entries: Array<{
    page: DocsPage;
    section: DocsSection | null;
    text: string;
    matchType: "title" | "navLabel" | "section" | "content";
  }>;
}

function buildIndex(content: DocsContent): SearchIndex {
  const entries: SearchIndex["entries"] = [];

  for (const page of content.pages) {
    // Index page title and navLabel
    entries.push({ page, section: null, text: page.title.toLowerCase(), matchType: "title" });
    entries.push({ page, section: null, text: page.navLabel.toLowerCase(), matchType: "navLabel" });

    for (const section of page.sections) {
      entries.push({ page, section, text: section.title.toLowerCase(), matchType: "section" });

      // Index paragraphs
      for (const p of section.paragraphs) {
        entries.push({ page, section, text: p.toLowerCase(), matchType: "content" });
      }

      // Index row titles and bodies
      if (section.rows) {
        for (const row of section.rows) {
          entries.push({ page, section, text: row.title.toLowerCase(), matchType: "section" });
          entries.push({ page, section, text: row.body.toLowerCase(), matchType: "content" });
        }
      }

      // Index table content
      if (section.table) {
        for (const row of section.table.rows) {
          for (const cell of row) {
            entries.push({ page, section, text: cell.toLowerCase(), matchType: "content" });
          }
        }
      }
    }
  }

  return { entries };
}

function search(index: SearchIndex, query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  const seen = new Set<string>();
  const results: SearchResult[] = [];

  for (const entry of index.entries) {
    if (!entry.text.includes(q)) continue;

    // Deduplicate by page + section + matchType
    const key = `${entry.page.slug}-${entry.section?.id ?? ""}-${entry.matchType}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Build matched text snippet
    const originalText = getOriginalText(entry);
    const matchIdx = originalText.toLowerCase().indexOf(q);
    const matchedText = matchIdx >= 0
      ? extractSnippet(originalText, matchIdx, q.length)
      : "";

    results.push({
      page: entry.page,
      section: entry.section,
      matchType: entry.matchType,
      matchedText,
      score: scoreMatch(entry, q),
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 20);
}

function getOriginalText(entry: SearchIndex["entries"][number]): string {
  // Reconstruct original case text from the entry
  if (entry.matchType === "title") return entry.page.title;
  if (entry.matchType === "navLabel") return entry.page.navLabel;
  if (entry.matchType === "section") {
    if (entry.section) return entry.section.title;
    return entry.page.title;
  }
  // content — search through paragraphs, rows, table
  if (!entry.section) return "";
  for (const p of entry.section.paragraphs) {
    if (p.toLowerCase() === entry.text) return p;
  }
  if (entry.section.rows) {
    for (const row of entry.section.rows) {
      if (row.title.toLowerCase() === entry.text) return row.title;
      if (row.body.toLowerCase() === entry.text) return row.body;
    }
  }
  if (entry.section.table) {
    for (const row of entry.section.table.rows) {
      for (const cell of row) {
        if (cell.toLowerCase() === entry.text) return cell;
      }
    }
  }
  return entry.text;
}

function extractSnippet(text: string, matchIdx: number, matchLen: number): string {
  const contextLen = 40;
  const start = Math.max(0, matchIdx - contextLen);
  const end = Math.min(text.length, matchIdx + matchLen + contextLen);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "…" + snippet;
  if (end < text.length) snippet = snippet + "…";
  return snippet;
}

function scoreMatch(entry: SearchIndex["entries"][number], query: string): number {
  let score = 0;
  // Match type weight
  switch (entry.matchType) {
    case "title": score += 100; break;
    case "navLabel": score += 80; break;
    case "section": score += 60; break;
    case "content": score += 40; break;
  }
  // Exact match bonus
  if (entry.text === query) score += 50;
  // Starts-with bonus
  if (entry.text.startsWith(query)) score += 30;
  return score;
}
