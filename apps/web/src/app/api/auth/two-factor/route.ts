import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getCurrentUserProfile,
  SESSION_COOKIE_NAME,
  setTwoFactorEnabled,
} from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const profile = getCurrentUserProfile(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!profile) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as { enabled?: boolean } | null;
  if (typeof payload?.enabled !== "boolean") {
    return NextResponse.json({ code: "enabled_required" }, { status: 400 });
  }

  setTwoFactorEnabled(profile.id, payload.enabled);

  return NextResponse.json({ ok: true, enabled: payload.enabled });
}
