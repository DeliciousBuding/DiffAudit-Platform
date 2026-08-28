/**
 * SPA navigation hooks over React Router.
 *
 * Mirrors the subset of the SPA navigation API used by page modules:
 * useRouter (push/replace/back/forward), usePathname, useSearchParams,
 * useParams and redirect.
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
    push(to: string, options?: { scroll?: boolean }) {
      void options;
      navigate(to);
    },
    replace(to: string, options?: { scroll?: boolean }) {
      void options;
      navigate(to, { replace: true });
    },
    back() {
      navigate(-1);
    },
    forward() {
      navigate(1);
    },
    refresh() {
      // SPA data refetch is implicit on navigation; no server router exists.
    },
    prefetch() {
      // React Router prefetches code-split routes on link hover.
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

export function redirect(to: string) {
  window.location.assign(to);
}
