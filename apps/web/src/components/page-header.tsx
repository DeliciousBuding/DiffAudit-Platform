import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-stretch">
      <div className="max-w-[760px]">
        <h1 className="text-[clamp(32px,4vw,42px)] font-semibold leading-[1.08] tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-[640px] text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-3 max-sm:w-full">{actions}</div> : null}
    </div>
  );
}
