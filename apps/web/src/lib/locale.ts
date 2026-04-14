import { type Locale, LOCALE_STORAGE_KEY } from "@/components/language-picker";

export const LOCALE_COOKIE_NAME = LOCALE_STORAGE_KEY;

export function resolveLocale(cookieValue: string | undefined | null): Locale {
  return cookieValue === "zh-CN" || cookieValue === "en-US" ? cookieValue : "en-US";
}

export function resolveLocaleFromCookieHeader(cookieHeader: string | undefined | null): Locale {
  const match = cookieHeader?.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE_NAME}=([^;]+)`));
  return resolveLocale(match ? decodeURIComponent(match[1]) : null);
}

export function resolveLocaleFromHeaderStore(headerStore: {
  get: (name: string) => string | null;
}): Locale {
  const forwardedLocale = headerStore.get("x-platform-locale");
  if (forwardedLocale === "zh-CN" || forwardedLocale === "en-US") {
    return forwardedLocale;
  }

  return resolveLocaleFromCookieHeader(headerStore.get("cookie"));
}
