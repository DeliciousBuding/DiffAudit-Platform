import { cookies, headers } from "next/headers";

import { githubOAuthConfigured, googleOAuthConfigured } from "@/lib/auth";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { getCurrentUserProfile, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getWorkspaceModeState } from "@/lib/workspace-source";
import { SettingsClient } from "../settings/SettingsClient";

export default async function WorkspaceAccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ emailVerified?: string; providerLink?: string }>;
}) {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const cookieStore = await cookies();
  const profile = getCurrentUserProfile(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const modeState = await getWorkspaceModeState();
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
      mode="account"
      initialDemoMode={modeState.demoModeEnabled}
      demoModeLocked={modeState.demoModeLocked}
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
