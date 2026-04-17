import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createSession,
  findOrCreateOAuthUser,
  linkOAuthAccount,
  sanitizeRedirectPath,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";

const STATE_COOKIE = "diffaudit_oauth_state";

type GitHubTokenResponse = { access_token?: string; error?: string };
type GitHubUserResponse = {
  id: number;
  login: string;
  name?: string | null;
  avatar_url: string | null;
  email: string | null;
};

function readStoredState(raw: string | undefined) {
  if (!raw) return null;

  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as {
      state: string;
      redirectTo?: string;
      mode?: "login" | "connect";
      userId?: string | null;
    };
  } catch {
    return null;
  }
}

function buildRedirectWithProviderStatus(
  redirectTo: string | undefined,
  providerLink: string,
  platformUrl: string,
) {
  const target = new URL(sanitizeRedirectPath(redirectTo, "/workspace/account"), platformUrl);
  target.searchParams.set("providerLink", providerLink);
  return target;
}

function buildPlatformRedirect(path: string, platformUrl: string) {
  return new URL(path, platformUrl);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const platformUrl = process.env.DIFFAUDIT_PLATFORM_URL ?? "http://localhost:3000";

  const cookieStore = await cookies();
  const storedState = readStoredState(cookieStore.get(STATE_COOKIE)?.value);
  cookieStore.delete(STATE_COOKIE);

  if (!code || !state || !storedState || state !== storedState.state) {
    return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_state", platformUrl));
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_config", platformUrl));
  }

  let tokenRes: Response;
  try {
    tokenRes = await fetch("https://github.com/login/oauth/access_token", {
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
  } catch {
    return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_network_github", platformUrl));
  }

  const tokenPayload = (await tokenRes.json()) as GitHubTokenResponse;
  if (!tokenPayload.access_token) {
    return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_token", platformUrl));
  }

  let userRes: Response;
  try {
    userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "DiffAudit-Platform",
      },
    });
  } catch {
    return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_network_github", platformUrl));
  }

  if (!userRes.ok) {
    return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_user", platformUrl));
  }

  const user = (await userRes.json()) as GitHubUserResponse;

  let email = user.email;
  let emailVerified = false;
  if (!email) {
    let emailRes: Response;
    try {
      emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenPayload.access_token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "DiffAudit-Platform",
        },
      });
    } catch {
      return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_network_github", platformUrl));
    }
    if (emailRes.ok) {
      const emails = (await emailRes.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
      const preferred = emails.find((item) => item.primary) ?? emails[0];
      email = preferred?.email ?? null;
      emailVerified = Boolean(preferred?.verified);
    }
  }

  const profile = {
    username: user.login,
    displayName: user.name ?? user.login,
    email,
    emailVerified,
    avatarUrl: user.avatar_url,
  };

  if (storedState.mode === "connect" && storedState.userId) {
    const result = linkOAuthAccount(storedState.userId, "github", String(user.id), profile);
    if (!result.ok) {
      return NextResponse.redirect(
        buildRedirectWithProviderStatus(
          storedState.redirectTo,
          result.reason === "provider_in_use" ? "github_in_use" : "github_already_connected",
          platformUrl,
        ),
      );
    }

    return NextResponse.redirect(
      buildRedirectWithProviderStatus(
        storedState.redirectTo,
        result.status === "already_linked" ? "github_already_connected" : "github_connected",
        platformUrl,
      ),
    );
  }

  const appUser = findOrCreateOAuthUser("github", String(user.id), profile);

  const token = createSession(appUser.id);
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

  return NextResponse.redirect(
    buildPlatformRedirect(sanitizeRedirectPath(storedState.redirectTo), platformUrl),
  );
}
