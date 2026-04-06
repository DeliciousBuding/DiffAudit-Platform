export const SESSION_COOKIE_NAME = "diffaudit_session";

type AuthEnv = {
  DIFFAUDIT_SHARED_USERNAME?: string;
  DIFFAUDIT_SHARED_PASSWORD?: string;
  DIFFAUDIT_SESSION_TOKEN?: string;
};

export type AuthConfig = {
  sharedUsername: string;
  sharedPassword: string;
  sessionToken: string;
};

export function readAuthConfig(env: AuthEnv = process.env as AuthEnv): AuthConfig {
  return {
    sharedUsername: env.DIFFAUDIT_SHARED_USERNAME ?? "",
    sharedPassword: env.DIFFAUDIT_SHARED_PASSWORD ?? "",
    sessionToken: env.DIFFAUDIT_SESSION_TOKEN ?? "",
  };
}

export function authConfigIsReady(config: AuthConfig): boolean {
  return Boolean(
    config.sharedUsername && config.sharedPassword && config.sessionToken,
  );
}

export function credentialsAreValid(
  config: AuthConfig,
  credentials: { username: string; password: string },
): boolean {
  return (
    authConfigIsReady(config) &&
    credentials.username === config.sharedUsername &&
    credentials.password === config.sharedPassword
  );
}

export function sessionTokenIsValid(
  config: AuthConfig,
  token: string | undefined,
): boolean {
  return authConfigIsReady(config) && Boolean(token) && token === config.sessionToken;
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
