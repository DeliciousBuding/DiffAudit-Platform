export const SESSION_COOKIE_NAME = "diffaudit_session";
export const DEFAULT_REDIRECT_PATH = "/workspace";

type AuthEnv = {
  DIFFAUDIT_PLATFORM_URL?: string;
  DIFFAUDIT_SHARED_USERNAME?: string;
  DIFFAUDIT_SHARED_PASSWORD?: string;
  DIFFAUDIT_SESSION_TOKEN?: string;
};

export type AuthConfig = {
  platformUrl: string;
  username: string;
  password: string;
  sessionToken: string;
};

export function readAuthConfig(env: AuthEnv = process.env as AuthEnv): AuthConfig {
  return {
    platformUrl: env.DIFFAUDIT_PLATFORM_URL ?? "http://localhost:3000",
    username: env.DIFFAUDIT_SHARED_USERNAME ?? "change-me",
    password: env.DIFFAUDIT_SHARED_PASSWORD ?? "change-me",
    sessionToken: env.DIFFAUDIT_SESSION_TOKEN ?? "change-me-session",
  };
}

export function sessionTokenIsValid(
  config: AuthConfig,
  token: string | undefined,
): boolean {
  return Boolean(config.sessionToken) && Boolean(token) && token === config.sessionToken;
}

export function sanitizeRedirectPath(
  redirectPath: string | null | undefined,
  fallbackPath: string = DEFAULT_REDIRECT_PATH,
): string {
  if (!redirectPath) {
    return fallbackPath;
  }

  const normalizedPath = redirectPath.trim();

  if (!normalizedPath.startsWith("/") || normalizedPath.startsWith("//")) {
    return fallbackPath;
  }

  return normalizedPath;
}

export function buildLoginPath(redirectPath: string): string {
  const safeRedirectPath = sanitizeRedirectPath(redirectPath);
  const loginUrl = new URL("/login", "http://localhost");
  loginUrl.searchParams.set("redirectTo", safeRedirectPath);
  return `${loginUrl.pathname}${loginUrl.search}`;
}

export function credentialsAreValid(
  config: AuthConfig,
  payload: { username?: string; password?: string },
): boolean {
  return payload.username === config.username && payload.password === config.password;
}

export function protectedPagePath(pathname: string): boolean {
  return pathname === "/workspace" || pathname.startsWith("/workspace/");
}

export function protectedApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/v1/");
}
