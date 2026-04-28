import type { ReactNode } from "react";

export function WorkspacePageFrame({
  eyebrow,
  title,
  description,
  actions,
  children,
  titleClassName = "text-lg",
  descriptionClassName = "text-xs",
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <div className="space-y-4">
      <div className={`border-b border-border pb-3 ${actions ? "flex items-start justify-between gap-4" : ""}`}>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</div>
          <h1 className={`mt-1 font-semibold ${titleClassName}`.trim()}>{title}</h1>
          <p className={`mt-0.5 text-muted-foreground ${descriptionClassName}`.trim()}>{description}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function WorkspaceSectionCard({
  title,
  actions,
  children,
  className = "",
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-border bg-card ${className}`.trim()}>
      <div className="border-b border-border bg-muted/20 px-3 py-2 flex items-center justify-between gap-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        {actions ? <div>{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
