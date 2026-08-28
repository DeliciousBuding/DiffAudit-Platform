import { Suspense, use } from "react";

import { clientSessionToken } from "@/lib/auth-config";
import { stableLoad } from "@/lib/stable-promise";

import { renderWorkspaceSettingsPage } from "./render-workspace-settings";

const renderSettingsPage = () =>
  stableLoad(`settings:${clientSessionToken() ? "signed-in" : "anon"}`, () => renderWorkspaceSettingsPage({ mode: "settings" }));

function SettingsLoaded() {
  return use(renderSettingsPage());
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <SettingsLoaded />
    </Suspense>
  );
}
