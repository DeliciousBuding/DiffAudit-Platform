import { clientLocale, clientSessionToken } from "@/lib/next-shims/runtime";
import { githubOAuthConfigured, googleOAuthConfigured } from "@/lib/auth-config";
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
  const locale = clientLocale();
  const modeState = await getWorkspaceModeState();
  const sessionToken = clientSessionToken();

  return (
    <SettingsClient
      locale={locale}
      initialDemoMode={modeState.demoModeEnabled}
      demoModeLocked={modeState.demoModeLocked}
      initialProfile={sessionToken ? undefined : null}
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
