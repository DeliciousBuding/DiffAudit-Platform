/**
 * next/headers shim for the SPA.
 *
 * The legacy page modules read locale and session cookies from `headers()` /
 * `cookies()`. In the browser these come from `document.cookie` instead.
 * Only `get()` semantics are provided (duck-typed by consumers).
 */

export type ShimHeaderStore = {
  get: (name: string) => string | null | undefined;
};

function cookieValue(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Never construct a real `Headers` here: browsers forbid setting the
 * `cookie` header on a Headers instance. Consumers only call `.get()`.
 */
export function headers(): Promise<ShimHeaderStore> {
  const store: ShimHeaderStore = {
    get(name: string) {
      if (name === "cookie") return document.cookie || null;
      if (name === "x-platform-locale") return cookieValue(PLATFORM_LOCALE_COOKIE) ?? null;
      return null;
    },
  };
  return Promise.resolve(store);
}

const PLATFORM_LOCALE_COOKIE = "platform-locale-v2";
const PLATFORM_LOCALE_HEADER = "x-platform-locale";

export function cookies() {
  return Promise.resolve({
    get(name: string) {
      const value = cookieValue(name);
      return value !== undefined ? { value } : undefined;
    },
    set(_name: string, _value: string) {
      // Session cookies are managed by the Go gateway. No-op in the shim.
    },
    delete(_name: string) {
      // Sessions are revoked server-side. No-op in the shim.
    },
  });
}

export { PLATFORM_LOCALE_COOKIE, PLATFORM_LOCALE_HEADER };
