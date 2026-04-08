import { NextResponse } from "next/server";

import { readAuthConfig } from "@/lib/auth";

export async function POST() {
  const config = readAuthConfig();
  const loginUrl = new URL("/login", config.portalUrl);

  return NextResponse.json(
    {
      message: "Platform no longer handles login. Use the portal login flow instead.",
      loginUrl: loginUrl.toString(),
    },
    { status: 410 },
  );
}
