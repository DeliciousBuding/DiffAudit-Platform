import { type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return Response.json({ username: null }, { status: 401 });
  }

  // Lazy import to avoid issues in edge runtime
  const { validateSession } = await import("@/lib/auth");
  const session = validateSession(token);
  if (!session) {
    return Response.json({ username: null }, { status: 401 });
  }

  return Response.json({ username: session.username });
}
