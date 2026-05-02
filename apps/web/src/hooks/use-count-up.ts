"use client";

import { useEffect, useRef, useState } from "react";

type UseCountUpOptions = {
  /** Target numeric value */
  target: number;
  /** Animation duration in ms (default: 800) */
  duration?: number;
  /** Number of decimal places (default: 0) */
  decimals?: number;
  /** Easing function (default: ease-out cubic) */
  easing?: (t: number) => number;
  /** Start animation immediately on mount (default: true) */
  autoStart?: boolean;
};

/** Default ease-out cubic */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animated count-up hook for numeric values.
 * Returns the current display value and a restart function.
 *
 * Usage:
 *   const displayValue = useCountUp({ target: 42, duration: 800 });
 */
export function useCountUp({
  target,
  duration = 800,
  decimals = 0,
  easing = easeOutCubic,
  autoStart = true,
}: UseCountUpOptions): number {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const startTimeRef = useRef(0);
  const prevTargetRef = useRef(target);

  useEffect(() => {
    // If target didn't change, skip
    if (prevTargetRef.current === target && displayValue === target) return;
    prevTargetRef.current = target;

    if (!autoStart) return;

    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    startValueRef.current = displayValue;
    startTimeRef.current = performance.now();

    function animate(now: number) {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const current = startValueRef.current + (target - startValueRef.current) * easedProgress;

      setDisplayValue(Number(current.toFixed(decimals)));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(Number(target.toFixed(decimals)));
        animationRef.current = null;
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, decimals, autoStart]);

  return displayValue;
}
