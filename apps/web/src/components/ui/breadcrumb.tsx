import * as React from "react";
import { ChevronRight as ChevronRightIcon, MoreHorizontal as MoreHorizontalIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Breadcrumb — accessible trail navigation (replaces the hand-rolled
 * `components/breadcrumb.tsx` which hand-wired `<nav aria-label>` + separators).
 *
 * Plain composition (no behavioural primitive needed): Breadcrumb >
 * BreadcrumbList > (BreadcrumbItem > (BreadcrumbLink | BreadcrumbPage))
 * BreadcrumbSeparator. For client-side routing, wrap a `next/link` in
 * `BreadcrumbLink` via its `render` prop, or pass a plain `href` for a styled
 * anchor.
 */
function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground break-words sm:gap-2",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="breadcrumb-link"
      className={cn("rounded transition-colors hover:text-foreground", className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      aria-disabled="true"
      className={cn("font-medium text-foreground", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      className={cn("[&>svg]:size-3 [&>svg]:text-muted-foreground/60", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon strokeWidth={1.5} />}
    </li>
  );
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-5 items-center justify-center text-muted-foreground", className)}
      {...props}
    >
      <MoreHorizontalIcon strokeWidth={1.5} />
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
