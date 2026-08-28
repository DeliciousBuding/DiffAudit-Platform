import { Suspense, cache, use } from "react";

import { renderWorkspaceSettingsPage } from "./render-workspace-settings";

const renderSettingsPage = cache(() => renderWorkspaceSettingsPage({ mode: "settings" }));

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
