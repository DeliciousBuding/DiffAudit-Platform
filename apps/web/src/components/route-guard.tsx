import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

import { isWorkspaceDemoModeEnabled } from "@/lib/workspace-source";

/**
 * Client-side guard replacing the Next middleware (proxy.ts) semantics for
 * workspace routes: demo mode bypasses, live mode requires a valid session
 * and redirects to /login?redirectTo=... otherwise. API-level protection for
 * /api/v1/* lives in the Go gateway middleware.
 */
export function WorkspaceRouteGuard() {
  const location = useLocation();
  const [authState, setAuthState] = useState<"ok" | "checking" | "redirect">(
    isWorkspaceDemoModeEnabled() ? "ok" : "checking",
  );

  useEffect(() => {
    if (authState !== "checking") return;
    const controller = new AbortController();
    fetch("/api/auth/me", { signal: controller.signal })
      .then((response) => setAuthState(response.ok ? "ok" : "redirect"))
      .catch(() => setAuthState("redirect"));
    return () => controller.abort();
  }, [authState]);

  if (authState === "redirect") {
    const redirectTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirectTo=${redirectTo}`} replace />;
  }

  return <Outlet />;
}
