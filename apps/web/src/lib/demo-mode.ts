import { cookies } from "next/headers";

import { DEMO_MODE_COOKIE } from "@/lib/demo-mode-constants";

const ENABLED_VALUES = new Set(["1", "true", "yes", "on", "demo"]);

function normalizeFlag(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isDemoModeForcedServer(env: NodeJS.ProcessEnv = process.env): boolean {
  return (
    ENABLED_VALUES.has(normalizeFlag(env.DIFFAUDIT_FORCE_DEMO_MODE))
    || ENABLED_VALUES.has(normalizeFlag(env.DIFFAUDIT_DEMO_MODE))
  );
}

/**
 * Browser-side demo-mode detection. Mirrors the server semantics: forced by
 * env, then the `platform-demo-mode` cookie with `0` disabling demo, default
 * enabled.
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

export async function isDemoModeEnabledServer(request?: Request): Promise<boolean> {
  if (isDemoModeForcedServer()) {
    return true;
  }

  const headerCookie = request?.headers.get("cookie");
  if (headerCookie) {
    const parsed = headerCookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${DEMO_MODE_COOKIE}=`));

    if (parsed) {
      const value = parsed.slice(DEMO_MODE_COOKIE.length + 1);
      if (value === "0") return false;
      if (value === "1") return true;
    }
  }

  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(DEMO_MODE_COOKIE)?.value;
    if (cookieValue === "0") {
      return false;
    }
    if (cookieValue === "1") {
      return true;
    }
  } catch {
    return true;
  }

  return true;
}
