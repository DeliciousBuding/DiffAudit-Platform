import {
  sanitizeAuditJobPayload,
} from "@/lib/audit-job-payload";
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
import { listDemoJobs } from "@/lib/demo-jobs-store";
import { isDemoModeEnabledClient, isDemoModeForcedClient } from "@/lib/demo-mode";

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

export function isWorkspaceDemoModeEnabled(): boolean {
  return isDemoModeEnabledClient();
}

export async function getWorkspaceDataMode(): Promise<WorkspaceDataMode> {
  return isDemoModeEnabledClient() ? "demo" : "live";
}

export async function getWorkspaceModeState(): Promise<WorkspaceModeState> {
  const demoModeEnabled = isDemoModeEnabledClient();
  return {
    mode: demoModeEnabled ? "demo" : "live",
    demoModeEnabled,
    demoModeLocked: isDemoModeForcedClient(),
  };
}

export async function getWorkspaceCatalogData(): Promise<CatalogDashboardViewModel | null> {
  return fetchCatalogDashboard();
}

export async function getWorkspaceAttackDefenseData(): Promise<AttackDefenseTableViewModel | null> {
  return fetchAttackDefenseTable();
}

export async function getWorkspaceAuditJobsData(): Promise<ReturnType<typeof listDemoJobs>> {
  return isDemoModeEnabledClient()
    ? sanitizeAuditJobPayload(listDemoJobs())
    : [];
}
