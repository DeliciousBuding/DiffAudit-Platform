"use client";

import { useEffect, useRef } from "react";

/**
 * Attaches a ResizeObserver to the returned ref's element.
 * Toggles the `is-scrollable` CSS class when the element's
 * scrollWidth exceeds its clientWidth (horizontal overflow).
 */
export function useScrollFade<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function check() {
      if (el) {
        el.classList.toggle("is-scrollable", el.scrollWidth > el.clientWidth);
      }
    }
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
