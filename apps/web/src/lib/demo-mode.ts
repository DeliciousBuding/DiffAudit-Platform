import { DEMO_MODE_COOKIE } from "@/lib/demo-mode-constants";

const ENABLED_VALUES = new Set(["1", "true", "yes", "on", "demo"]);

function normalizeFlag(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

/**
 * Browser-side demo-mode detection. Mirrors the legacy server semantics:
 * forced by build-time env, then the `platform-demo-mode` cookie with `0`
 * disabling demo, default enabled.
 */
export function isDemoModeForcedClient(): boolean {
  const value = normalizeFlag(import.meta.env.VITE_DIFFAUDIT_DEMO_MODE ?? "");
  return ENABLED_VALUES.has(value);
}

export function isDemoModeEnabledClient(): boolean {
  if (isDemoModeForcedClient()) {
    return true;
  }

  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${DEMO_MODE_COOKIE}=([^;]+)`));
    if (match) {
      const value = decodeURIComponent(match[1]);
      if (value === "0") return false;
      if (value === "1") return true;
    }
  }

  return true;
}
