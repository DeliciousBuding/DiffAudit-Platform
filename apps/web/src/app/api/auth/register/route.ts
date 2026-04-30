import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createSession, createUser, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { username?: string; email?: string; password?: string }
    | null;

  if (!payload?.username || !payload.password) {
    return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
  }

  if (payload.password.length < 8) {
    return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const user = await createUser(payload.username, payload.email ?? null, payload.password);
    const token = createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
    return NextResponse.json({ ok: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("UNIQUE")) {
      return NextResponse.json({ message: "Username or email already exists." }, { status: 409 });
    }
    console.error("Registration failed:", error);
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}
