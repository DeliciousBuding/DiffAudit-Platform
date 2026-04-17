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

const STATE_COOKIE = "diffaudit_google_oauth_state";

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  error?: string;
};

type GoogleUserResponse = {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
};

function buildUsername(email: string | undefined, name: string | undefined, subject: string) {
  const seed = email?.split("@")[0] ?? name ?? `google-${subject.slice(0, 8)}`;
  const normalized = seed
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  return normalized || `google-${subject.slice(0, 8)}`;
}

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
  const target = new URL(sanitizeRedirectPath(redirectTo, "/workspace/settings"), platformUrl);
  target.searchParams.set("providerLink", providerLink);
  return target;
}

function buildPlatformRedirect(path: string, platformUrl: string) {
  return new URL(path, platformUrl);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const platformUrl = process.env.DIFFAUDIT_PLATFORM_URL ?? "http://localhost:3000";

  const cookieStore = await cookies();
  const storedState = readStoredState(cookieStore.get(STATE_COOKIE)?.value);
  cookieStore.delete(STATE_COOKIE);

  if (!code || !returnedState || !storedState || returnedState !== storedState.state) {
    return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_state", platformUrl));
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_config", platformUrl));
  }

  let tokenRes: Response;
  try {
    tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${platformUrl}/api/auth/google/callback`,
      }),
    });
  } catch {
    return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_network_google", platformUrl));
  }

  const tokenPayload = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenPayload.access_token) {
    return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_token", platformUrl));
  }

  let userRes: Response;
  try {
    userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
      },
    });
  } catch {
    return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_network_google", platformUrl));
  }

  if (!userRes.ok) {
    return NextResponse.redirect(buildPlatformRedirect("/login?error=oauth_user", platformUrl));
  }

  const user = (await userRes.json()) as GoogleUserResponse;
  const profile = {
    username: buildUsername(user.email, user.name, user.sub),
    displayName: user.name ?? user.email ?? "Google user",
    email: user.email ?? null,
    emailVerified: Boolean(user.email_verified),
    avatarUrl: user.picture ?? null,
  };

  if (storedState.mode === "connect" && storedState.userId) {
    const result = linkOAuthAccount(storedState.userId, "google", user.sub, profile);
    if (!result.ok) {
      return NextResponse.redirect(
        buildRedirectWithProviderStatus(
          storedState.redirectTo,
          result.reason === "provider_in_use" ? "google_in_use" : "google_already_connected",
          platformUrl,
        ),
      );
    }

    return NextResponse.redirect(
      buildRedirectWithProviderStatus(
        storedState.redirectTo,
        result.status === "already_linked" ? "google_already_connected" : "google_connected",
        platformUrl,
      ),
    );
  }

  const appUser = findOrCreateOAuthUser("google", user.sub, profile);

  const token = createSession(appUser.id);
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

  return NextResponse.redirect(
    buildPlatformRedirect(sanitizeRedirectPath(storedState.redirectTo), platformUrl),
  );
}
