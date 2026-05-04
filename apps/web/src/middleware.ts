import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "diffaudit_session";
const LOCALE_COOKIE = "platform-locale-v2";
const LOCALE_HEADER = "x-platform-locale";

const DEMO_MODE_COOKIE = "platform-demo-mode";

function isDemoMode(request: NextRequest): boolean {
  const envDemo =
    process.env.DIFFAUDIT_DEMO_MODE?.trim().toLowerCase() ||
    process.env.DIFFAUDIT_FORCE_DEMO_MODE?.trim().toLowerCase() ||
    "";
  if (["1", "true", "yes", "on", "demo"].includes(envDemo)) return true;

  const cookie = request.cookies.get(DEMO_MODE_COOKIE)?.value;
  if (cookie === "0") return false;
  // Enabled by default when no explicit disable
  return true;
}

function isProtectedPage(pathname: string) {
  return pathname === "/workspace" || pathname.startsWith("/workspace/");
}

function isProtectedApi(pathname: string) {
  return pathname.startsWith("/api/v1/");
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  const hasSession = Boolean(sessionCookie?.value && sessionCookie.value.length >= 32);
  const locale = request.cookies.get(LOCALE_COOKIE)?.value;
  const requestHeaders = new Headers(request.headers);

  if (locale === "zh-CN" || locale === "en-US") {
    requestHeaders.set(LOCALE_HEADER, locale);
  } else {
    requestHeaders.delete(LOCALE_HEADER);
  }

  // In demo mode, allow API calls without a session cookie
  if (!hasSession && isProtectedApi(pathname) && !isDemoMode(request)) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  if (!hasSession && isProtectedPage(pathname) && !isDemoMode(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/docs/:path*",
    "/trial/:path*",
    "/login",
    "/register",
    "/workspace/:path*",
    "/api/v1/:path*",
  ],
};
