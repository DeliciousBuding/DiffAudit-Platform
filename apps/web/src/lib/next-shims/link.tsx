/**
 * next/link shim for the SPA, backed by React Router's Link.
 * `prefetch` is accepted for API compatibility and ignored.
 */

import type { ComponentProps } from "react";
import { Link as RouterLink } from "react-router";

type NextLinkProps = Omit<ComponentProps<typeof RouterLink>, "to"> & {
  href: string;
  prefetch?: boolean;
};

export default function Link({ href, prefetch: _prefetch, ...rest }: NextLinkProps) {
  return <RouterLink to={href} {...rest} />;
}
