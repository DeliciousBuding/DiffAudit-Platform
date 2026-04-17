"use client";

import { DEMO_MODE_COOKIE, DEMO_MODE_STORAGE_KEY } from "@/lib/demo-mode-constants";

export function setDemoModeClient(enabled: boolean) {
  try {
    window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, enabled ? "1" : "0");
  } catch {}
  document.cookie = `${DEMO_MODE_COOKIE}=${enabled ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
}

export function getDemoModeClient() {
  try {
    return window.localStorage.getItem(DEMO_MODE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
