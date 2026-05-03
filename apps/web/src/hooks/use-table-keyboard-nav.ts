"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Vim-style J/K keyboard navigation for table rows.
 * When enabled and focus is within the table container,
 * J selects the next row, K selects the previous row,
 * Enter opens the selected row, Escape deselects.
 */
export function useTableKeyboardNav<T>(
  items: T[],
  onSelect: (item: T | null) => void,
  opts?: { enabled?: boolean; containerRef?: React.RefObject<HTMLElement | null> },
) {
  const { enabled = true, containerRef } = opts ?? {};
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const selectRow = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < items.length) {
        setActiveIndex(idx);
        onSelect(items[idx]);
      }
    },
    [items, onSelect],
  );

  const deselect = useCallback(() => {
    setActiveIndex(-1);
    onSelect(null);
  }, [onSelect]);

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      // Only handle when focus is within the container (if provided)
      if (containerRef?.current && !containerRef.current.contains(document.activeElement)) {
        return;
      }

      // Don't handle when focus is in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case "j":
        case "J":
          e.preventDefault();
          setActiveIndex((prev) => {
            const next = Math.min(prev + 1, items.length - 1);
            selectRow(next);
            return next;
          });
          break;
        case "k":
        case "K":
          e.preventDefault();
          setActiveIndex((prev) => {
            const next = Math.max(prev - 1, 0);
            selectRow(next);
            return next;
          });
          break;
        case "Enter":
          if (activeIndex >= 0 && activeIndex < items.length) {
            e.preventDefault();
            onSelect(items[activeIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          deselect();
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, items, activeIndex, selectRow, deselect, onSelect, containerRef]);

  return { activeIndex, deselect };
}
