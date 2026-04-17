import { NextResponse } from "next/server";

import { createUser } from "@/lib/auth";

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
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ message: "Username or email already exists." }, { status: 409 });
  }
}
