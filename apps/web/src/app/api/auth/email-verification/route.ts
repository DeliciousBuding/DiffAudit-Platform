import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getCurrentUserProfile,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const profile = getCurrentUserProfile(token);

  if (!profile) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({
    message: "Email verification is not available.",
    code: "email_verification_unavailable",
  }, { status: 501 });
}
