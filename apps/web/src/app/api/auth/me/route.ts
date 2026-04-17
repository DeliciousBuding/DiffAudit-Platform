import { type NextRequest } from "next/server";

import { getCurrentUserProfile, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return Response.json({ user: null }, { status: 401 });
  }

  const user = getCurrentUserProfile(token);
  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({ user });
}
