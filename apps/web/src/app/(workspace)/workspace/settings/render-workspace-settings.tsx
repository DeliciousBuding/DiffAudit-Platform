import { cookies, headers } from "next/headers";

import {
  getCurrentUserProfile,
  githubOAuthConfigured,
  googleOAuthConfigured,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { getWorkspaceModeState } from "@/lib/workspace-source";
import {
  SettingsClient,
  type EmailVerificationStatus,
  type ProviderLinkStatus,
} from "./SettingsClient";

export type WorkspaceSettingsSearchParams = {
  emailVerified?: string | string[];
  provider?: string | string[];
};

type RenderWorkspaceSettingsOptions = {
  mode?: "settings" | "account";
  searchParams?: WorkspaceSettingsSearchParams;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function renderWorkspaceSettingsPage({
  mode = "settings",
  searchParams,
}: RenderWorkspaceSettingsOptions = {}) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = resolveLocaleFromHeaderStore(headerStore);
  const modeState = await getWorkspaceModeState();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return (
    <SettingsClient
      locale={locale}
      initialDemoMode={modeState.demoModeEnabled}
      demoModeLocked={modeState.demoModeLocked}
      initialProfile={getCurrentUserProfile(sessionToken)}
      initialEmailVerificationStatus={firstParam(searchParams?.emailVerified) as EmailVerificationStatus | undefined}
      initialProviderLinkStatus={firstParam(searchParams?.provider) as ProviderLinkStatus | undefined}
      oauthEnabled={{
        google: googleOAuthConfigured(),
        github: githubOAuthConfigured(),
      }}
      mode={mode}
    />
  );
}
