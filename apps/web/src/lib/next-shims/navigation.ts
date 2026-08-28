/**
 * next/navigation shim for the SPA, backed by React Router v7.
 *
 * Mirrors the subset of the Next API used by page modules:
 * useRouter, useSearchParams, usePathname, useParams, redirect.
 */

import {
  useLocation,
  useNavigate,
  useParams as useReactRouterParams,
  useSearchParams as useReactRouterSearchParams,
} from "react-router";

export function useRouter() {
  const navigate = useNavigate();
  return {
    push(to: string | URL) {
      navigate(String(to));
    },
    replace(to: string | URL) {
      navigate(String(to), { replace: true });
    },
    back() {
      navigate(-1);
    },
    forward() {
      navigate(1);
    },
    refresh() {
      // No server router in the SPA; navigation refetches are implicit.
    },
    prefetch() {
      // React Router performs code-splitting prefetch on link hover.
    },
  };
}

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParams() {
  return useReactRouterSearchParams()[0];
}

export function useParams() {
  return useReactRouterParams();
}

export function useSelectedLayoutSegments() {
  return [];
}

export function redirect(to: string) {
  // Equivalent of Next's server redirect for non-render call sites.
  // Inside components prefer `<Navigate to={to} replace />`.
  window.location.assign(to);
}
