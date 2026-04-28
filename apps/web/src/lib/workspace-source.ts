import { fetchAttackDefenseTable, type AttackDefenseTableViewModel } from "@/lib/attack-defense-table";
import { fetchCatalogDashboard, type CatalogDashboardViewModel } from "@/lib/catalog";
import { isDemoModeEnabledServer } from "@/lib/demo-mode";

export type WorkspaceDataMode = "demo" | "live";

export async function getWorkspaceDataMode(): Promise<WorkspaceDataMode> {
  return (await isDemoModeEnabledServer()) ? "demo" : "live";
}

export async function getWorkspaceCatalogData(): Promise<CatalogDashboardViewModel | null> {
  return fetchCatalogDashboard();
}

export async function getWorkspaceAttackDefenseData(): Promise<AttackDefenseTableViewModel | null> {
  return fetchAttackDefenseTable();
}
