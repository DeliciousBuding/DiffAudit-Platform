"use client";

import { useState } from "react";

const DEMO_MODE_KEY = "platform-demo-mode-v1";

/**
 * Hook to check if Demo Mode is enabled.
 * Demo Mode uses snapshot data instead of calling the Runtime API.
 */
export function useDemoMode(): boolean {
  const [isDemoMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(DEMO_MODE_KEY) === "1";
    } catch {
      return false;
    }
  });

  return isDemoMode;
}

/**
 * Check if Demo Mode is enabled (synchronous, client-side only).
 */
export function isDemoModeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEMO_MODE_KEY) === "1";
  } catch {
    return false;
  }
}
