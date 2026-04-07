export type NavItem = {
  href: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon: "image" | "dashboard" | "stack" | "report" | "guide";
  shortLabel: string;
};

export const navItems: NavItem[] = [
  { href: "/audit", title: "图像审计", subtitle: "单图检测", icon: "image", shortLabel: "审计" },
  { href: "/dashboard", title: "系统状态", subtitle: "状态与证据", icon: "dashboard", shortLabel: "状态" },
  { href: "/batch", title: "批量检测", subtitle: "队列与结果", icon: "stack", shortLabel: "批量" },
  { href: "/report", title: "证据报告", subtitle: "摘要与导出", icon: "report", shortLabel: "报告" },
  { href: "/guide", title: "接入指南", subtitle: "接口与联调", badge: "API", icon: "guide", shortLabel: "指南" },
];
