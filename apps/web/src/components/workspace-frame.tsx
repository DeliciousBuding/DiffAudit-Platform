import type { ReactNode } from "react";

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
    <div className="workspace-page-frame">
      {hasHeader ? (
        <div className={`workspace-page-header ${actions ? "has-actions" : ""}`}>
          <div>
            {eyebrow ? <div className="workspace-page-eyebrow">{eyebrow}</div> : null}
            {title ? <h1 className={`workspace-page-title ${titleClassName}`.trim()}>{title}</h1> : null}
            {description ? <p className={`workspace-page-description ${descriptionClassName}`.trim()}>{description}</p> : null}
          </div>
          {actions ? <div className="workspace-page-actions">{actions}</div> : null}
        </div>
      ) : null}
      {rightRail ? (
        <div className="workspace-page-with-rail">
          <div className="workspace-page-primary">{children}</div>
          <aside className="workspace-page-rail">{rightRail}</aside>
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
    <section className={`workspace-section-card ${className}`.trim()}>
      <div className="workspace-section-card-header">
        <h2 className="workspace-section-card-title">{title}</h2>
        {actions ? <div>{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
