import { NextResponse } from "next/server";

import { verifyEmailToken } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/workspace/account?emailVerified=missing", request.url));
  }

  const result = verifyEmailToken(token);
  if (!result.ok) {
    return NextResponse.redirect(new URL(`/workspace/account?emailVerified=${result.reason}`, request.url));
  }

  return NextResponse.redirect(new URL("/workspace/account?emailVerified=1", request.url));
}
