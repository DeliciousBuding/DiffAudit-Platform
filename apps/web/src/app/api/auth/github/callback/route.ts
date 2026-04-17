import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createSession,
  findOrCreateOAuthUser,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";

const STATE_COOKIE = "diffaudit_oauth_state";

type GitHubTokenResponse = { access_token?: string; error?: string };
type GitHubUserResponse = {
  id: number;
  login: string;
  avatar_url: string | null;
  email: string | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const platformUrl = process.env.DIFFAUDIT_PLATFORM_URL ?? "http://localhost:3000";

  const cookieStore = await cookies();
  const storedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=oauth_state", request.url));
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=oauth_config", request.url));
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${platformUrl}/api/auth/github/callback`,
      state,
    }),
  });

  const tokenPayload = (await tokenRes.json()) as GitHubTokenResponse;
  if (!tokenPayload.access_token) {
    return NextResponse.redirect(new URL("/login?error=oauth_token", request.url));
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "DiffAudit-Platform",
    },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/login?error=oauth_user", request.url));
  }

  const user = (await userRes.json()) as GitHubUserResponse;

  let email = user.email;
  if (!email) {
    const emailRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "DiffAudit-Platform",
      },
    });
    if (emailRes.ok) {
      const emails = (await emailRes.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
      email = emails.find((item) => item.primary)?.email ?? emails[0]?.email ?? null;
    }
  }

  const appUser = findOrCreateOAuthUser("github", String(user.id), {
    username: user.login,
    email,
    avatarUrl: user.avatar_url,
  });

  const token = createSession(appUser.id);
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

  return NextResponse.redirect(new URL("/workspace", request.url));
}
