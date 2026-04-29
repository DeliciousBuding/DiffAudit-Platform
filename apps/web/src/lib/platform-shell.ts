import { getNavItems, type NavItem } from "./navigation";

export function findActiveNavItem(
  pathname: string,
  items: readonly NavItem[],
): NavItem {
  const matched = items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0];

  return matched ?? items[0] ?? getNavItems("en-US")[0];
}
