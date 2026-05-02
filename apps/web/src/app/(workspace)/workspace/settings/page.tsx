import { renderWorkspaceSettingsPage } from "./render-workspace-settings";

export default async function SettingsPage() {
  return renderWorkspaceSettingsPage({ mode: "settings" });
}
