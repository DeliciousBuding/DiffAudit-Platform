import { ReactNode } from "react";

type SectionCardProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section className={`surface-card p-6 ${className}`.trim()}>
      {eyebrow ? (
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
          {eyebrow}
        </div>
      ) : null}
      {title ? <h2 className="mt-3 text-xl font-semibold tracking-tight">{title}</h2> : null}
      {description ? (
        <p className="mt-3 max-w-[72ch] text-sm leading-7 text-muted-foreground">{description}</p>
      ) : null}
      <div className={title || description || eyebrow ? "mt-6" : ""}>{children}</div>
    </section>
  );
}
