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
export type WorkspaceNavGroup = "primary" | "account";

export type WorkspaceNavRegistryEntry = {
  key: WorkspaceNavKey;
  href: string;
  icon: WorkspaceNavIcon;
  group: WorkspaceNavGroup;
};

export const WORKSPACE_NAV_REGISTRY: readonly WorkspaceNavRegistryEntry[] = [
  { key: "workspace", href: "/workspace/start", icon: "dashboard", group: "primary" },
  { key: "audits", href: "/workspace/audits", icon: "spark", group: "primary" },
  { key: "modelAssets", href: "/workspace/model-assets", icon: "model", group: "primary" },
  { key: "riskFindings", href: "/workspace/risk-findings", icon: "risk", group: "primary" },
  { key: "reportCenter", href: "/workspace/reports", icon: "report", group: "primary" },
  { key: "apiKeys", href: "/workspace/api-keys", icon: "key", group: "account" },
  { key: "account", href: "/workspace/account", icon: "account", group: "account" },
  { key: "settings", href: "/workspace/settings", icon: "settings", group: "account" },
] as const;
