import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  cta?: {
    label: string;
    href: string;
  };
  compact?: boolean;
};

function DefaultIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-10 w-10 stroke-muted-foreground/40 fill-none stroke-[1.2]"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 9h6M9 13h4" />
    </svg>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  cta,
  compact = false,
}: EmptyStateProps) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <div className="flex h-8 w-8 items-center justify-center">
          {icon ?? (
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6 stroke-muted-foreground/40 fill-none stroke-[1.4]"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M9 9h6M9 13h4" />
            </svg>
          )}
        </div>
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="max-w-48 text-xs text-muted-foreground/70">{description}</p>
        {cta && (
          <a
            href={cta.href}
            className="mt-1 text-xs font-medium text-[var(--accent-blue)] hover:underline"
          >
            {cta.label}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/40">
        {icon ?? <DefaultIcon />}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {cta && (
        <a
          href={cta.href}
          className="mt-1 inline-flex items-center rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-[var(--palette-grey-900)]"
        >
          {cta.label}
        </a>
      )}
    </div>
  );
}
