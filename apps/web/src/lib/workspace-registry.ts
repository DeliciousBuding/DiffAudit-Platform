export type WorkspaceNavKey =
  | "workspace"
  | "audits"
  | "modelAssets"
  | "riskFindings"
  | "reportCenter"
  | "apiKeys"
  | "account"
  | "settings";

export type WorkspaceNavIcon = "dashboard" | "spark" | "model" | "risk" | "report" | "key" | "account" | "settings";

export type WorkspaceNavRegistryEntry = {
  key: WorkspaceNavKey;
  href: string;
  icon: WorkspaceNavIcon;
};

export const WORKSPACE_NAV_REGISTRY: readonly WorkspaceNavRegistryEntry[] = [
  { key: "workspace", href: "/workspace/start", icon: "dashboard" },
  { key: "audits", href: "/workspace/audits", icon: "spark" },
  { key: "modelAssets", href: "/workspace/model-assets", icon: "model" },
  { key: "riskFindings", href: "/workspace/risk-findings", icon: "risk" },
  { key: "reportCenter", href: "/workspace/reports", icon: "report" },
  { key: "apiKeys", href: "/workspace/api-keys", icon: "key" },
  { key: "account", href: "/workspace/account", icon: "account" },
  { key: "settings", href: "/workspace/settings", icon: "settings" },
] as const;
