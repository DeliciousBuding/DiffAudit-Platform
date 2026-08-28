import { Suspense, use } from "react";
import { useSearchParams } from "@/lib/router/navigation";

import { clientSessionToken } from "@/lib/auth-config";
import { stableLoad } from "@/lib/stable-promise";

import type { WorkspaceSettingsSearchParams } from "../settings/render-workspace-settings";
import { renderWorkspaceSettingsPage } from "../settings/render-workspace-settings";

const renderAccountPage = (emailVerified: string | undefined, provider: string | undefined) =>
  stableLoad(
    `account:${emailVerified ?? ""}|${provider ?? ""}:${clientSessionToken() ? "signed-in" : "anon"}`,
    () =>
      renderWorkspaceSettingsPage({
        mode: "account",
        searchParams: { emailVerified, provider } satisfies WorkspaceSettingsSearchParams,
      }),
  );

type AccountLoadedProps = {
  emailVerified?: string;
  provider?: string;
};

function AccountLoaded({ emailVerified, provider }: AccountLoadedProps) {
  return use(renderAccountPage(emailVerified, provider));
}

export default function WorkspaceAccountPage() {
  const searchParams = useSearchParams();
  const emailVerified = searchParams.get("emailVerified") ?? undefined;
  const provider = searchParams.get("provider") ?? undefined;

  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <AccountLoaded emailVerified={emailVerified} provider={provider} />
    </Suspense>
  );
}
