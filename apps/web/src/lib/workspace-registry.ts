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
  shortcut: string;
};

export const WORKSPACE_NAV_REGISTRY: readonly WorkspaceNavRegistryEntry[] = [
  { key: "workspace", href: "/workspace/start", icon: "dashboard", group: "primary", shortcut: "Ctrl+1" },
  { key: "audits", href: "/workspace/audits", icon: "spark", group: "primary", shortcut: "Ctrl+2" },
  { key: "modelAssets", href: "/workspace/model-assets", icon: "model", group: "primary", shortcut: "Ctrl+3" },
  { key: "riskFindings", href: "/workspace/risk-findings", icon: "risk", group: "primary", shortcut: "Ctrl+4" },
  { key: "reportCenter", href: "/workspace/reports", icon: "report", group: "primary", shortcut: "Ctrl+5" },
  { key: "apiKeys", href: "/workspace/api-keys", icon: "key", group: "account", shortcut: "Ctrl+6" },
  { key: "account", href: "/workspace/account", icon: "account", group: "account", shortcut: "Ctrl+7" },
  { key: "settings", href: "/workspace/settings", icon: "settings", group: "account", shortcut: "Ctrl+," },
] as const;
