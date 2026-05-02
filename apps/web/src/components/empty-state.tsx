import Link from "next/link";
import { type LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string } | { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/30 mb-4">
        <Icon size={28} strokeWidth={1.2} className="text-muted-foreground/60" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action && "href" in action ? (
        <Link href={action.href} className="workspace-btn-primary px-4 py-2 text-sm">
          {action.label}
        </Link>
      ) : action ? (
        <button onClick={action.onClick} className="workspace-btn-primary px-4 py-2 text-sm">
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
