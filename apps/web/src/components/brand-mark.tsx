import Link from "next/link";
import Image from "next/image";

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

  const content = (
    <span className={className}>
      <Image
        src={showWordmark ? "/brand/diffaudit-logo-black.svg" : "/brand/diffaudit-logo-black-no-text.svg"}
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
