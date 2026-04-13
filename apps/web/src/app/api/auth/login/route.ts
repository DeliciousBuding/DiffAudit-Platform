import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  credentialsAreValid,
  readAuthConfig,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: Request) {
  const config = readAuthConfig();
  const payload = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  if (
    !payload?.username ||
    !payload.password ||
    !credentialsAreValid(config, payload)
  ) {
    return NextResponse.json(
      { message: "共享账户或密码不正确，请重新输入。" },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, config.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}
