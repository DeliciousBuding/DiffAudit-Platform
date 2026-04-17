import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createSession,
  ensureLegacySharedUser,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  verifyCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  if (!payload?.username || !payload.password) {
    return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
  }

  await ensureLegacySharedUser();

  const user = await verifyCredentials(payload.username, payload.password);
  if (!user) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const token = createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

  return NextResponse.json({ ok: true, user: { id: user.id, username: user.username } });
}
