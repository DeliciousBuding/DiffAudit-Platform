import { navItems, type NavItem } from "./navigation";

export function findActiveNavItem(
  pathname: string,
  items: readonly NavItem[] = navItems,
): NavItem {
  const matched = items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0];

  return matched ?? items[0];
}
