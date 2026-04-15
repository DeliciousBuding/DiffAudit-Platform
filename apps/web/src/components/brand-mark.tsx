"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/hooks/use-theme";

export function BrandMark({
  compact = false,
  hideText = false,
  hero = false,
  href,
  prefetch,
  ariaLabel,
}: {
  compact?: boolean;
  hideText?: boolean;
  hero?: boolean;
  href?: string;
  prefetch?: boolean;
  ariaLabel?: string;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const showWordmark = !hideText && !compact;

  const className = [
    "brand-mark",
    hero ? "brand-mark-hero" : "",
    showWordmark ? "brand-mark-wordmark" : "brand-mark-symbol",
  ]
    .filter(Boolean)
    .join(" ");

  // Use white logo in dark mode, black logo in light mode
  const logoSrc = isDark
    ? (showWordmark ? "/brand/diffaudit-logo-white.svg" : "/brand/diffaudit-logo-white-no-text.svg")
    : (showWordmark ? "/brand/diffaudit-logo-black.svg" : "/brand/diffaudit-logo-black-no-text.svg");

  const content = (
    <span className={className}>
      <Image
        src={logoSrc}
        alt="DiffAudit"
        width={showWordmark ? 827 : 552}
        height={showWordmark ? 480 : 317}
        className="brand-mark-image"
        priority={hero}
      />
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} prefetch={prefetch} aria-label={ariaLabel} className="inline-flex">
      {content}
    </Link>
  );
}
