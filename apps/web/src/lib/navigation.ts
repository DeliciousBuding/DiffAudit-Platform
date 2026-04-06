export type NavItem = {
  href: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon: "image" | "dashboard" | "stack" | "report" | "guide";
  shortLabel: string;
};

export const navItems: NavItem[] = [
  { href: "/audit", title: "图像审计", subtitle: "成员推断检测", icon: "image", shortLabel: "审计" },
  { href: "/dashboard", title: "审计仪表盘", subtitle: "状态与指标", icon: "dashboard", shortLabel: "仪表盘" },
  { href: "/batch", title: "批量检测", subtitle: "队列与任务", icon: "stack", shortLabel: "批量" },
  { href: "/report", title: "合规报告", subtitle: "导出与解读", icon: "report", shortLabel: "报告" },
  { href: "/guide", title: "接入指南", subtitle: "平台接入说明", badge: "API", icon: "guide", shortLabel: "指南" },
];
