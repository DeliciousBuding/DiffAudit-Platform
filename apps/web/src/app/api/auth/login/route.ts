import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createSession,
  ensureLegacySharedUser,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  verifyCredentials,
} from "@/lib/auth";
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
} from "@/lib/auth-rate-limit";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  if (!payload?.username || !payload.password) {
    return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
  }

  const rateLimit = checkLoginRateLimit(request, payload.username);
  if (rateLimit.limited) {
    return NextResponse.json(
      { message: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  await ensureLegacySharedUser();

  const user = await verifyCredentials(payload.username, payload.password);
  if (!user) {
    recordFailedLoginAttempt(request, payload.username);
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  resetLoginRateLimit(request, payload.username);

  const token = createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

  return NextResponse.json({ ok: true, user: { id: user.id, username: user.username } });
}
