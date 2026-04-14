import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "diffaudit_session";

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
  const hasSession = request.cookies.has(SESSION_COOKIE);

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/workspace/:path*", "/api/v1/:path*"],
};
