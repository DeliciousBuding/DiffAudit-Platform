"use client";

import Link from "next/link";

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
  const showWordmark = !hideText && !compact;

  const className = [
    "brand-mark",
    hero ? "brand-mark-hero" : "",
    showWordmark ? "brand-mark-wordmark" : "brand-mark-symbol",
  ]
    .filter(Boolean)
    .join(" ");

  // Render both light and dark logos; CSS toggles visibility based on data-theme
  const lightSrc = showWordmark ? "/brand/diffaudit-logo-black.svg" : "/brand/diffaudit-logo-black-no-text.svg";
  const darkSrc = showWordmark ? "/brand/diffaudit-logo-white.svg" : "/brand/diffaudit-logo-white-no-text.svg";

  const content = (
    <span className={className}>
      {/* Light mode logo — hidden in dark mode */}
      <img
        src={lightSrc}
        alt="DiffAudit"
        className="brand-mark-image brand-logo-light"
        loading={hero ? "eager" : "lazy"}
      />
      {/* Dark mode logo — hidden in light mode */}
      <img
        src={darkSrc}
        alt=""
        className="brand-mark-image brand-logo-dark"
        aria-hidden="true"
        loading={hero ? "eager" : "lazy"}
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
