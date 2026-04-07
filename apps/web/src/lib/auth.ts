export const SESSION_COOKIE_NAME = "diffaudit_session";

type AuthEnv = {
  DIFFAUDIT_PORTAL_URL?: string;
  DIFFAUDIT_SESSION_TOKEN?: string;
};

export type AuthConfig = {
  portalUrl: string;
  sessionToken: string;
};

export function readAuthConfig(env: AuthEnv = process.env as AuthEnv): AuthConfig {
  return {
    portalUrl: env.DIFFAUDIT_PORTAL_URL ?? "http://localhost:3001",
    sessionToken: env.DIFFAUDIT_SESSION_TOKEN ?? "",
  };
}

export function sessionTokenIsValid(
  config: AuthConfig,
  token: string | undefined,
): boolean {
  return Boolean(config.sessionToken) && Boolean(token) && token === config.sessionToken;
}

export function buildPortalLoginUrl(
  config: AuthConfig,
  requestUrl: string,
  redirectPath: string,
): string {
  const portalUrl = new URL("/login", config.portalUrl);
  const requestOrigin = new URL(requestUrl).origin;
  const redirectTarget =
    portalUrl.origin === requestOrigin
      ? redirectPath
      : `${requestOrigin}${redirectPath}`;

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
