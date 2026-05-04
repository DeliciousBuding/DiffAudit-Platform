import type { WorkspaceSettingsSearchParams } from "../settings/render-workspace-settings";
import { renderWorkspaceSettingsPage } from "../settings/render-workspace-settings";

export default async function WorkspaceAccountPage({
  searchParams,
}: {
  searchParams?: Promise<WorkspaceSettingsSearchParams>;
}) {
  return renderWorkspaceSettingsPage({
    mode: "account",
    searchParams: await searchParams,
  });
}
