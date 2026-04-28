import { ReactNode } from "react";

type WorkspacePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
  children: ReactNode;
};

export function WorkspacePage({
  eyebrow,
  title,
  description,
  aside,
  children,
}: WorkspacePageProps) {
  return (
    <div className="workspace-hero">
      <section className="workspace-highlight">
        <div className="caption">{eyebrow}</div>
        <h1 className="mt-3 text-[36px] font-[450] leading-tight">{title}</h1>
        <p className="mt-4 max-w-[58ch] text-sm leading-7 text-muted-foreground">{description}</p>
      </section>
      {aside ? <aside className="workspace-kpis">{aside}</aside> : null}
      <div className="lg:col-span-2">{children}</div>
    </div>
  );
}
