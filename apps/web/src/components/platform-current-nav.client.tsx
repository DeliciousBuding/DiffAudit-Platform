"use client";

import { usePathname } from "next/navigation";

import { findActiveNavItem } from "@/lib/platform-shell";

type PlatformCurrentNavProps = {
  mode?: "short" | "full";
};

export function PlatformCurrentNav({ mode = "short" }: PlatformCurrentNavProps) {
  const pathname = usePathname();
  const current = findActiveNavItem(pathname);

  if (mode === "full") {
    return <>DiffAudit / {current.shortLabel}</>;
  }

  return <>{current.shortLabel}</>;
}

