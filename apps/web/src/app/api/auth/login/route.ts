import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  credentialsAreValid,
  readAuthConfig,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;
  const config = readAuthConfig();

  if (
    !payload?.username ||
    !payload.password ||
    !credentialsAreValid(config, {
      username: payload.username,
      password: payload.password,
    })
  ) {
    return NextResponse.json(
      { message: "共享账号或密码错误。" },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, config.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}
