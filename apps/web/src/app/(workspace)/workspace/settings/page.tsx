import { cookies, headers } from "next/headers";

import { githubOAuthConfigured, googleOAuthConfigured } from "@/lib/auth";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { getCurrentUserProfile, SESSION_COOKIE_NAME } from "@/lib/auth";
import { isDemoModeEnabledServer, isDemoModeForcedServer } from "@/lib/demo-mode";
import { SettingsClient } from "./SettingsClient";

export default async function WorkspaceSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ emailVerified?: string; providerLink?: string }>;
}) {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const cookieStore = await cookies();
  const profile = getCurrentUserProfile(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const initialDemoMode = await isDemoModeEnabledServer();
  const demoModeLocked = isDemoModeForcedServer();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const emailVerificationStatus =
    typeof resolvedSearchParams.emailVerified === "string"
      ? resolvedSearchParams.emailVerified
      : null;
  const providerLinkStatus =
    typeof resolvedSearchParams.providerLink === "string"
      ? resolvedSearchParams.providerLink
      : null;

  return (
    <SettingsClient
      locale={locale}
      mode="settings"
      initialDemoMode={initialDemoMode}
      demoModeLocked={demoModeLocked}
      initialProfile={profile}
      oauthEnabled={{
        google: googleOAuthConfigured(),
        github: githubOAuthConfigured(),
      }}
      initialEmailVerificationStatus={
        emailVerificationStatus === "1"
        || emailVerificationStatus === "missing"
        || emailVerificationStatus === "invalid"
        || emailVerificationStatus === "expired"
        || emailVerificationStatus === "missing_pending_email"
          ? emailVerificationStatus
          : null
      }
      initialProviderLinkStatus={
        providerLinkStatus === "google_connected"
        || providerLinkStatus === "google_already_connected"
        || providerLinkStatus === "google_in_use"
        || providerLinkStatus === "github_connected"
        || providerLinkStatus === "github_already_connected"
        || providerLinkStatus === "github_in_use"
          ? providerLinkStatus
          : null
      }
    />
  );
}
