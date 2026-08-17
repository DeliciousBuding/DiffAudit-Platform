"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * useIsMobile — viewport breakpoint hook used by the sidebar block to decide
 * between the desktop (collapsible) and mobile (Sheet) render paths. Returns
 * `undefined` during SSR/first paint (treated as falsy) to avoid a
 * hydration mismatch — the sidebar's own logic tolerates that.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMediaBoolean(mediaQuery.matches);
    const setIsMediaBoolean = (matches: boolean) => setIsMobile(matches);
    setIsMediaBoolean(mediaQuery.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
