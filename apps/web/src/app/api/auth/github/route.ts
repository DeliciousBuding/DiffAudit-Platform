import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCurrentUserProfile, resolvePlatformUrl, sanitizeRedirectPath, SESSION_COOKIE_NAME } from "@/lib/auth";

const STATE_COOKIE = "diffaudit_oauth_state";

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const platformUrl = resolvePlatformUrl(request);
  const requestUrl = new URL(request.url);
  const intent = requestUrl.searchParams.get("intent");
  const redirectTo = sanitizeRedirectPath(
    requestUrl.searchParams.get("redirectTo"),
    intent === "connect" ? "/workspace/account" : undefined,
  );

  if (!clientId || !clientSecret) {
    return NextResponse.json({ message: "GitHub OAuth is not configured." }, { status: 500 });
  }

  if (!platformUrl) {
    return NextResponse.json({ message: "Platform public URL is not configured." }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  const currentUser = getCurrentUserProfile(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const mode = intent === "connect" && currentUser ? "connect" : "login";

  if (intent === "connect" && !currentUser) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent(redirectTo)}`, platformUrl));
  }

  const payload = Buffer.from(JSON.stringify({
    state,
    redirectTo,
    mode,
    userId: currentUser?.id ?? null,
  }), "utf8").toString("base64url");
  cookieStore.set(STATE_COOKIE, payload, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${platformUrl}/api/auth/github/callback`);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);

  return NextResponse.redirect(url);
}
