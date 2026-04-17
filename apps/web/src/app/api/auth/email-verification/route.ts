import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createEmailVerificationRequest,
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

  const platformUrl = process.env.DIFFAUDIT_PLATFORM_URL ?? "http://localhost:3000";
  const request = createEmailVerificationRequest(profile.id, platformUrl);

  if (!request) {
    return NextResponse.json({ message: "No pending email to verify." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    email: request.email,
    verificationUrl: request.verificationUrl,
  });
}
