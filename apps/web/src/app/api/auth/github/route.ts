import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const STATE_COOKIE = "diffaudit_oauth_state";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const platformUrl = process.env.DIFFAUDIT_PLATFORM_URL ?? "http://localhost:3000";

  if (!clientId) {
    return NextResponse.json({ message: "GitHub OAuth is not configured." }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
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
