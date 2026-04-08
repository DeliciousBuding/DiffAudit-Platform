import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { buildPortalLoginUrl, readAuthConfig } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const config = readAuthConfig();

  redirect(
    buildPortalLoginUrl(
      config,
      `${proto}://${host}/login`,
      redirectTo || "/audit",
    ),
  );
}
