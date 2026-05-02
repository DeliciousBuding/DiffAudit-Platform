"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Thin progress bar at the top of the page that shows during navigation.
 * Fades in on route change, completes after a short delay.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Start progress on route change
    setVisible(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(60), 100);
    const t2 = setTimeout(() => setProgress(80), 300);
    const t3 = setTimeout(() => setProgress(100), 500);
    const t4 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] h-[2px]"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page loading"
    >
      <div
        className="h-full bg-[var(--accent-blue)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress < 100 ? "200ms" : "150ms",
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
