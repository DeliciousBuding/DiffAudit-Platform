export type NavItem = {
  href: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon: "spark" | "dashboard" | "report" | "settings";
  shortLabel: string;
};

export const navItems: NavItem[] = [
  { href: "/workspace", title: "工作台", subtitle: "待办与关键指标", icon: "dashboard", shortLabel: "工作台" },
  { href: "/workspace/audits", title: "审计流程", subtitle: "创建任务与查看结果", icon: "spark", shortLabel: "审计" },
  { href: "/workspace/reports", title: "报告", subtitle: "结果汇总与导出", icon: "report", shortLabel: "报告" },
  { href: "/workspace/settings", title: "设置", subtitle: "团队、密钥与偏好", icon: "settings", shortLabel: "设置" },
];
