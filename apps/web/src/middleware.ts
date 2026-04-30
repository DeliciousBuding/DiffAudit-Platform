import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "diffaudit_session";
const LOCALE_COOKIE = "platform-locale-v2";
const LOCALE_HEADER = "x-platform-locale";

function isProtectedPage(pathname: string) {
  return pathname === "/workspace" || pathname.startsWith("/workspace/");
}

function isProtectedApi(pathname: string) {
  return pathname.startsWith("/api/v1/");
}

function isAuthPage(pathname: string) {
  return pathname === "/login" || pathname === "/register";
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

  if (isAuthPage(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/workspace", request.url));
  }

  if (!hasSession && isProtectedApi(pathname)) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  if (!hasSession && isProtectedPage(pathname)) {
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
