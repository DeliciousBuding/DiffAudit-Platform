import { NextRequest, NextResponse } from "next/server";

import {
  buildLoginPath,
  DEFAULT_REDIRECT_PATH,
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
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT_PATH, request.url));
  }

  if (!hasSession && protectedApiPath(pathname)) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  if (!hasSession && protectedPagePath(pathname)) {
    return NextResponse.redirect(
      new URL(buildLoginPath(`${pathname}${search}`), request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/workspace/:path*",
    "/api/v1/:path*",
  ],
};
