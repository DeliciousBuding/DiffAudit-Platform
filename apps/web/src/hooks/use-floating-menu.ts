"use client";

import { type KeyboardEvent, useCallback, useEffect, useId, useRef, useState } from "react";

type Direction = 1 | -1;
type FloatingMenuFocusTarget = number | "first" | "last";

export function nextFloatingMenuIndex(currentIndex: number, itemCount: number, delta: Direction): number {
  if (itemCount <= 0) return 0;
  return (currentIndex + delta + itemCount) % itemCount;
}

export function resolveFloatingMenuFocusIndex(target: FloatingMenuFocusTarget, itemCount: number): number {
  if (itemCount <= 0) return 0;
  if (target === "first") return 0;
  if (target === "last") return itemCount - 1;
  if (target < 0) return Math.max(0, itemCount + target);
  return Math.min(target, itemCount - 1);
}

export function useFloatingMenu<TItem extends HTMLElement = HTMLElement>({
  itemSelector = "a[href], button:not([disabled])",
}: {
  itemSelector?: string;
} = {}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  const getMenuItems = useCallback(() => {
    if (!menuRef.current) return [];
    return Array.from(menuRef.current.querySelectorAll<TItem>(itemSelector));
  }, [itemSelector]);

  const focusMenuItem = useCallback((target: FloatingMenuFocusTarget) => {
    const items = getMenuItems();
    const index = resolveFloatingMenuFocusIndex(target, items.length);
    items[index]?.focus();
  }, [getMenuItems]);

  const openMenu = useCallback((focusTarget: FloatingMenuFocusTarget = "first") => {
    setOpen(true);
    window.requestAnimationFrame(() => focusMenuItem(focusTarget));
  }, [focusMenuItem]);

  const toggleMenu = useCallback(() => {
    if (open) {
      closeMenu(false);
      return;
    }
    openMenu();
  }, [closeMenu, open, openMenu]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        closeMenu(false);
      }
    }

    function handleDocumentKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [closeMenu, open]);

  function handleMenuKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    const items = getMenuItems();
    if (event.key === "Home") {
      event.preventDefault();
      focusMenuItem("first");
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusMenuItem("last");
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    const currentIndex = Math.max(0, items.findIndex((item) => item === document.activeElement));
    const nextIndex = nextFloatingMenuIndex(currentIndex, items.length, event.key === "ArrowDown" ? 1 : -1);
    focusMenuItem(nextIndex);
  }

  return {
    closeMenu,
    focusMenuItem,
    getMenuItems,
    handleMenuKeyDown,
    menuId,
    menuRef,
    open,
    openMenu,
    rootRef,
    toggleMenu,
    triggerRef,
  };
}
