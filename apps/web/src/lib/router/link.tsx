/**
 * SPA Link component over React Router.
 *
 * Mirrors the subset of the Next `Link` API used by page modules (`href` +
 * router props). Prefetch is accepted for API compatibility and ignored —
 * React Router handles code-split prefetch on hover.
 */

import type { ComponentProps } from "react";
import { Link as RouterLink } from "react-router";

type NextLinkProps = Omit<ComponentProps<typeof RouterLink>, "to" | "prefetch"> & {
  href: string;
  /**
   * Accepted for Next `Link` API compatibility and ignored. React Router's own
   * `prefetch` takes a descriptor string (`"intent" | "render" | ...`), so it is
   * omitted above rather than intersected — a boolean and a string union
   * intersect to `never`.
   */
  prefetch?: boolean;
};

export default function Link({ href, prefetch, ...rest }: NextLinkProps) {
  void prefetch;
  return <RouterLink to={href} {...rest} />;
}
