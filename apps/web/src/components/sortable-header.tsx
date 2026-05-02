"use client";

import type { ReactNode } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

type SortDirection = "asc" | "desc" | null;

export function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
}: {
  label: ReactNode;
  sortKey: string;
  currentSort: string | null;
  currentDir: SortDirection;
  onSort: (key: string) => void;
}) {
  const isActive = currentSort === sortKey;
  return (
    <th
      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => onSort(sortKey)}
      aria-sort={isActive ? (currentDir === "asc" ? "ascending" : "descending") : "none"}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          currentDir === "asc" ? <ChevronUp size={12} strokeWidth={1.5} /> : <ChevronDown size={12} strokeWidth={1.5} />
        ) : (
          <ChevronsUpDown size={12} strokeWidth={1.5} className="opacity-30" />
        )}
      </span>
    </th>
  );
}
