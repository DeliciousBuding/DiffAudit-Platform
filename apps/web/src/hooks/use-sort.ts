"use client";

import { useState, useCallback } from "react";

type SortDirection = "asc" | "desc" | null;

export function useSort<T>(items: T[], defaultSort?: string) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSort ?? null);
  const [sortDir, setSortDir] = useState<SortDirection>(defaultSort ? "asc" : null);

  const toggleSort = useCallback((key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }, [sortKey, sortDir]);

  const sorted = [...items].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const aVal = (a as Record<string, unknown>)[sortKey];
    const bVal = (b as Record<string, unknown>)[sortKey];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    let cmp: number;
    if (typeof aVal === "number" && typeof bVal === "number") {
      cmp = aVal - bVal;
    } else {
      cmp = String(aVal).localeCompare(String(bVal));
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  return { sorted, sortKey, sortDir, toggleSort };
}
