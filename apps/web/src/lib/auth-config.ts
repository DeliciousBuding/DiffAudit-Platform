/**
 * Client-safe auth constants, types and helpers.
 *
 * Auth logic itself lives in the Go gateway (/api/auth/*); the browser only
 * needs these pure constants/helpers to read session state and show OAuth
 * availability without bundling server code.
 */

export const SESSION_COOKIE_NAME = "diffaudit_session";
export const DEFAULT_REDIRECT_PATH = "/workspace";
const SESSION_TOKEN_MIN_LENGTH = 32;

export type CurrentUserProfile = {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  pendingEmail: string | null;
  emailVerified: boolean;
  avatarUrl: string | null;
  bio: string | null;
  providers: string[];
  hasPassword: boolean;
  twoFactorEnabled: boolean;
};

export type GitHubOAuthEnv = {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
};

export type GoogleOAuthEnv = {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

export function protectedPagePath(pathname: string): boolean {
  return pathname === "/workspace" || pathname.startsWith("/workspace/");
}

export function protectedApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/v1/");
}

export function authPagePath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/register";
}

export function hasPlausibleSessionToken(token: string | undefined | null): boolean {
  return Boolean(token && token.length >= SESSION_TOKEN_MIN_LENGTH);
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

export function clientSessionToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function clientLoggedIn(): boolean {
  return hasPlausibleSessionToken(clientSessionToken());
}
