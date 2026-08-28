/**
 * Client-side runtime helpers used by migrated page wrappers.
 *
 * These replace the `next/headers` / `next/navigation` server reads with
 * browser equivalents (cookie access). Demo-mode gating semantics live in
 * `@/lib/demo-mode` and are reused here.
 */

import { isDemoModeEnabledClient } from "@/lib/demo-mode";
import { resolveLocaleFromCookieHeader, type Locale } from "@/lib/locale";

import { hasPlausibleSessionToken } from "@/lib/auth-config";

const SESSION_COOKIE_NAME = "diffaudit_session";

function cookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function clientLocale(): Locale {
  if (typeof document === "undefined") return "en-US";
  return resolveLocaleFromCookieHeader(document.cookie);
}

export function clientSessionToken(): string | undefined {
  return cookieValue(SESSION_COOKIE_NAME);
}

export function clientLoggedIn(): boolean {
  return hasPlausibleSessionToken(clientSessionToken());
}

export const clientDemoMode: () => boolean = isDemoModeEnabledClient;
