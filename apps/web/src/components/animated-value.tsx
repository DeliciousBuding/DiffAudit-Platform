"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedValueProps = {
  value: string | number;
  className?: string;
};

/** Ease-out cubic easing */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Renders a numeric value with a smooth count-up animation on mount
 * and when the value changes. Non-numeric strings are rendered as-is.
 */
export function AnimatedValue({ value, className }: AnimatedValueProps) {
  const [display, setDisplay] = useState<string | number>(value);
  const prevRef = useRef(value);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    // Parse numeric value from string (e.g., "42" or "0.853" or "42%")
    const strValue = String(value);
    const match = strValue.match(/^(-?[\d.]+)(.*)$/);
    if (!match) {
      setDisplay(value);
      prevRef.current = value;
      return;
    }

    const targetNum = parseFloat(match[1]);
    const suffix = match[2];
    if (isNaN(targetNum)) {
      setDisplay(value);
      prevRef.current = value;
      return;
    }

    // Parse previous numeric value
    const prevStr = String(prevRef.current);
    const prevMatch = prevStr.match(/^(-?[\d.]+)(.*)$/);
    const startNum = prevMatch ? (parseFloat(prevMatch[1]) || 0) : 0;

    // Determine decimal places from the string
    const decimalPlaces = match[1].includes(".") ? match[1].split(".")[1].length : 0;

    // Skip animation if value hasn't changed
    if (prevRef.current === value) {
      setDisplay(value);
      return;
    }

    prevRef.current = value;

    const duration = 700;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = startNum + (targetNum - startNum) * eased;
      setDisplay(`${current.toFixed(decimalPlaces)}${suffix}`);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(value);
        animRef.current = null;
      }
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [value]);

  // Initialize on mount with a count-up from 0
  useEffect(() => {
    const strValue = String(value);
    const match = strValue.match(/^(-?[\d.]+)(.*)$/);
    if (!match) return;

    const targetNum = parseFloat(match[1]);
    const suffix = match[2];
    if (isNaN(targetNum) || targetNum === 0) return;

    const decimalPlaces = match[1].includes(".") ? match[1].split(".")[1].length : 0;
    const duration = 800;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = targetNum * eased;
      setDisplay(`${current.toFixed(decimalPlaces)}${suffix}`);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(value);
        animRef.current = null;
      }
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <span className={className}>{display}</span>;
}
