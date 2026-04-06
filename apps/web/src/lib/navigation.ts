export type NavItem = {
  href: string;
  title: string;
  subtitle: string;
  badge?: string;
  glyph: string;
  shortLabel: string;
};

export const navItems: NavItem[] = [
  { href: "/audit", title: "图像审计", subtitle: "成员推断检测", glyph: "AU", shortLabel: "审计" },
  { href: "/dashboard", title: "审计仪表盘", subtitle: "状态与指标", glyph: "DB", shortLabel: "仪表盘" },
  { href: "/batch", title: "批量检测", subtitle: "队列与任务", glyph: "BQ", shortLabel: "批量" },
  { href: "/report", title: "合规报告", subtitle: "导出与解读", glyph: "RP", shortLabel: "报告" },
  { href: "/guide", title: "接入指南", subtitle: "平台接入说明", badge: "API", glyph: "GD", shortLabel: "指南" },
];
