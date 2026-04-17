import { headers } from "next/headers";

import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { SettingsClient } from "./SettingsClient";

export default async function WorkspaceSettingsPage() {
  const locale = resolveLocaleFromHeaderStore(await headers());

  // Try to get username from session cookie (server-side, httpOnly cookie is readable here)
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie");
  const sessionToken = cookieHeader
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.split("=")[1];

  const session = sessionToken ? validateSession(sessionToken) : null;

  return <SettingsClient locale={locale} initialUsername={session?.username ?? null} />;
}
