import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

/**
 * WorkspacePageFrame + WorkspaceSectionCard — the two shared shells every
 * workspace page composes.
 *
 * Migrated off the bespoke `.workspace-page-*` / `.workspace-section-card*`
 * classes onto the `<Card>` primitive shell + inline Tailwind utilities that
 * preserve the exact DiffAudit brand values (16px radius, slate-900@4.5%
 * shadow, 13px section title, glass header tint that differs per mode). The
 * primitive gives the syntax (consistent border/bg/radius/shadow contract);
 * the inline utilities carry the brand.
 */

export function WorkspacePageFrame({
  eyebrow,
  title,
  description,
  actions,
  children,
  rightRail,
  titleClassName = "text-2xl",
  descriptionClassName = "text-sm",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  rightRail?: ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  const hasHeader = eyebrow || title || description || actions;
  return (
    <div className="grid gap-[22px] [animation:page-enter_0.3s_ease-out]">
      {hasHeader ? (
        <div
          className={`flex ${actions ? "items-center" : "items-end"} justify-between gap-6`}
        >
          <div className="min-w-0">
            {eyebrow ? (
              <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
                {eyebrow}
              </div>
            ) : null}
            {title ? (
              <h1
                className={`mt-1.5 font-[750] tracking-[-0.035em] leading-[1.08] text-foreground ${titleClassName}`.trim()}
              >
                {title}
              </h1>
            ) : null}
            {description ? (
              <p
                className={`mt-2 max-w-[760px] leading-[1.7] text-muted-foreground ${descriptionClassName}`.trim()}
              >
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2.5">{actions}</div>
          ) : null}
        </div>
      ) : null}
      {rightRail ? (
        <div className="grid [grid-template-columns:minmax(0,1fr)_minmax(286px,350px)] items-start gap-[22px]">
          <div className="grid min-w-0 gap-4">{children}</div>
          <aside className="grid min-w-0 gap-4">{rightRail}</aside>
        </div>
      ) : (
        children
      )}
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
    <Card
      className={`gap-0 overflow-hidden rounded-2xl border-border bg-card text-card-foreground shadow-[0_12px_34px_rgba(15,23,42,0.045)] ${className}`.trim()}
    >
      <div className="flex min-h-[50px] items-center justify-between gap-3.5 border-b border-border/72 bg-muted/40 px-[18px] py-[14px] dark:border-white/[0.08] dark:bg-white/[0.025]">
        <h2 className="text-[13px] font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </Card>
  );
}
