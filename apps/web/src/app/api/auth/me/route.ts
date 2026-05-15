import { type NextRequest } from "next/server";

import { getCurrentUserProfile, SESSION_COOKIE_NAME } from "@/lib/auth";
import { isDemoModeEnabledServer } from "@/lib/demo-mode";

async function anonymousResponse(request: NextRequest) {
  if (await isDemoModeEnabledServer(request)) {
    return Response.json({ user: null });
  }

  return Response.json({ user: null }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return anonymousResponse(request);
  }

  const user = getCurrentUserProfile(token);
  if (!user) {
    return anonymousResponse(request);
  }

  return Response.json({ user });
}
