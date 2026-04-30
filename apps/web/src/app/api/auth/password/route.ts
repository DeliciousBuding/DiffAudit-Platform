import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getCurrentUserProfile,
  SESSION_COOKIE_NAME,
  setUserPassword,
  verifyUserPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const profile = getCurrentUserProfile(token);

  if (!profile) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { currentPassword?: string; password?: string; confirmPassword?: string }
    | null;

  const password = payload?.password?.trim() ?? "";
  const confirmPassword = payload?.confirmPassword?.trim() ?? "";

  if (!password || !confirmPassword) {
    return NextResponse.json({ code: "password_required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ code: "password_too_short" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ code: "password_mismatch" }, { status: 400 });
  }

  if (profile.hasPassword) {
    const currentPassword = payload?.currentPassword ?? "";
    if (!currentPassword) {
      return NextResponse.json({ code: "current_password_required" }, { status: 400 });
    }

    const valid = await verifyUserPassword(profile.id, currentPassword);
    if (!valid) {
      return NextResponse.json({ code: "current_password_incorrect" }, { status: 401 });
    }
  }

  await setUserPassword(profile.id, password);

  return NextResponse.json({ ok: true });
}
