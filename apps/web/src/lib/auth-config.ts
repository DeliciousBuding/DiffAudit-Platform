/**
 * Client-safe auth constants and helpers.
 *
 * The server-side `@/lib/auth` module pulls in database and crypto
 * dependencies; browser modules must never import it. Pure helpers live
 * here so page wrappers can read session state and OAuth availability
 * without bundling server code.
 */

export const SESSION_COOKIE_NAME = "diffaudit_session";
export const DEFAULT_REDIRECT_PATH = "/workspace";
const SESSION_TOKEN_MIN_LENGTH = 32;

export function protectedPagePath(pathname: string): boolean {
  return pathname === "/workspace" || pathname.startsWith("/workspace/");
}

export function protectedApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/v1/");
}

export function authPagePath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/register";
}

export function sanitizeRedirectPath(
  redirectPath: string | null | undefined,
  fallbackPath: string = DEFAULT_REDIRECT_PATH,
): string {
  if (!redirectPath) return fallbackPath;
  const p = redirectPath.trim();
  if (!p.startsWith("/") || p.startsWith("//")) return fallbackPath;
  return p;
}

export function buildLoginPath(redirectPath: string): string {
  const safe = sanitizeRedirectPath(redirectPath);
  const url = new URL("/login", "http://localhost");
  url.searchParams.set("redirectTo", safe);
  return `${url.pathname}${url.search}`;
}

export function hasPlausibleSessionToken(token: string | undefined | null): boolean {
  return Boolean(token && token.length >= SESSION_TOKEN_MIN_LENGTH);
}

export type GitHubOAuthEnv = {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
};

export type GoogleOAuthEnv = {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

export function githubOAuthConfigured(env?: GitHubOAuthEnv): boolean {
  if (env) {
    return Boolean(env.GITHUB_CLIENT_ID?.trim() && env.GITHUB_CLIENT_SECRET?.trim());
  }
  return Boolean((import.meta.env.VITE_GITHUB_CLIENT_ID ?? "").trim());
}

export function googleOAuthConfigured(env?: GoogleOAuthEnv): boolean {
  if (env) {
    return Boolean(env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim());
  }
  return Boolean((import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim());
}
