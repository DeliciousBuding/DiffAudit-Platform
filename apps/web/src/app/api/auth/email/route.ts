import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getCurrentUserProfile,
  SESSION_COOKIE_NAME,
  setPendingEmail,
} from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const profile = getCurrentUserProfile(token);

  if (!profile) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as { email?: string } | null;
  if (!payload?.email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  const result = setPendingEmail(profile.id, payload.email);
  if (!result.ok) {
    if (result.reason === "invalid_email") {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }

    return NextResponse.json({ message: "This email is already in use." }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    pendingEmail: result.pendingEmail,
  });
}
