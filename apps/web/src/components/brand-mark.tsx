import Image from "next/image";

export function BrandMark({
  compact = false,
  hideText = false,
  hero = false,
}: {
  compact?: boolean;
  hideText?: boolean;
  hero?: boolean;
}) {
  const showWordmark = !hideText && !compact;
  const className = [
    "brand-mark",
    hero ? "brand-mark-hero" : "",
    showWordmark ? "brand-mark-wordmark" : "brand-mark-symbol",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <Image
        src={showWordmark ? "/brand/diffaudit-logo-black.svg" : "/brand/diffaudit-logo-black-no-text.svg"}
        alt="DiffAudit"
        width={showWordmark ? 827 : 552}
        height={showWordmark ? 480 : 317}
        className="brand-mark-image"
        priority={hero}
      />
    </div>
  );
}
