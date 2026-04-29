import {
  fetchAttackDefenseTable,
  type AttackDefenseRowViewModel,
  type AttackDefenseTableViewModel,
} from "@/lib/attack-defense-table";
import {
  fetchCatalogDashboard,
  type CatalogDashboardViewModel,
  type CatalogEntryViewModel,
  type CatalogTrack,
} from "@/lib/catalog";
import { isDemoModeEnabledServer, isDemoModeForcedServer } from "@/lib/demo-mode";

export type {
  AttackDefenseRowViewModel,
  AttackDefenseTableViewModel,
  CatalogDashboardViewModel,
  CatalogEntryViewModel,
  CatalogTrack,
};

export type WorkspaceDataMode = "demo" | "live";
export type WorkspaceModeState = {
  mode: WorkspaceDataMode;
  demoModeEnabled: boolean;
  demoModeLocked: boolean;
};

export async function getWorkspaceDataMode(): Promise<WorkspaceDataMode> {
  return (await isDemoModeEnabledServer()) ? "demo" : "live";
}

export async function getWorkspaceModeState(): Promise<WorkspaceModeState> {
  const demoModeEnabled = await isDemoModeEnabledServer();
  return {
    mode: demoModeEnabled ? "demo" : "live",
    demoModeEnabled,
    demoModeLocked: isDemoModeForcedServer(),
  };
}

export async function getWorkspaceCatalogData(): Promise<CatalogDashboardViewModel | null> {
  return fetchCatalogDashboard();
}

export async function getWorkspaceAttackDefenseData(): Promise<AttackDefenseTableViewModel | null> {
  return fetchAttackDefenseTable();
}
