export const SESSION_COOKIE_NAME = "diffaudit_session";
export const DEFAULT_REDIRECT_PATH = "/audit";

type AuthEnv = {
  DIFFAUDIT_PORTAL_URL?: string;
  DIFFAUDIT_PLATFORM_URL?: string;
  DIFFAUDIT_SESSION_TOKEN?: string;
};

export type AuthConfig = {
  portalUrl: string;
  platformUrl: string;
  sessionToken: string;
};

export function readAuthConfig(env: AuthEnv = process.env as AuthEnv): AuthConfig {
  return {
    portalUrl: env.DIFFAUDIT_PORTAL_URL ?? "http://localhost:3001",
    platformUrl: env.DIFFAUDIT_PLATFORM_URL ?? "http://localhost:3000",
    sessionToken: env.DIFFAUDIT_SESSION_TOKEN ?? "",
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

export function buildPortalLoginUrl(
  config: AuthConfig,
  requestUrl: string,
  redirectPath: string,
): string {
  const portalUrl = new URL("/login", config.portalUrl);
  const requestOrigin = new URL(requestUrl).origin;
  const platformOrigin = new URL(config.platformUrl).origin;
  const safeRedirectPath = sanitizeRedirectPath(redirectPath);
  const redirectTarget =
    portalUrl.origin === requestOrigin
      ? safeRedirectPath
      : new URL(safeRedirectPath, platformOrigin).toString();

  portalUrl.searchParams.set("redirectTo", redirectTarget);
  return portalUrl.toString();
}

export function protectedPagePath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/guide") ||
    pathname.startsWith("/report") ||
    pathname.startsWith("/batch")
  );
}

export function protectedApiPath(pathname: string): boolean {
  return pathname === "/health" || pathname.startsWith("/api/v1/");
}
