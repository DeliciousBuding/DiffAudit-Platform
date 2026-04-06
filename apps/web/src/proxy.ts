import { NextRequest, NextResponse } from "next/server";

import {
  protectedApiPath,
  protectedPagePath,
  readAuthConfig,
  SESSION_COOKIE_NAME,
  sessionTokenIsValid,
} from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const config = readAuthConfig();
  const hasSession = sessionTokenIsValid(
    config,
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/audit", request.url));
  }

  if (!hasSession && protectedApiPath(pathname)) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  if (!hasSession && protectedPagePath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/audit/:path*",
    "/dashboard/:path*",
    "/guide/:path*",
    "/report/:path*",
    "/batch/:path*",
    "/api/v1/:path*",
    "/health",
  ],
};
