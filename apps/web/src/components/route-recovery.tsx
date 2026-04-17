"use client";

import { useEffect } from "react";

const RECOVERY_KEY_PREFIX = "diffaudit-route-recovery";
const RECOVERABLE_ROUTE_ERRORS = [
  "ChunkLoadError",
  "Loading chunk",
  "Failed to fetch dynamically imported module",
  "Failed to load script",
  "Importing a module script failed",
  "page couldn't be loaded",
  "This page couldn't load",
  "Failed to execute 'insertBefore' on 'Node'",
];

function shouldRecoverFromMessage(message: string) {
  return RECOVERABLE_ROUTE_ERRORS.some((fragment) => message.includes(fragment));
}

function getRecoveryKey(pathname: string) {
  return `${RECOVERY_KEY_PREFIX}:${pathname}`;
}

export function RouteRecovery() {
  useEffect(() => {
    const pathname = window.location.pathname;
    const recoveryKey = getRecoveryKey(pathname);

    // If the page rendered successfully, clear any previous one-shot recovery marker.
    window.sessionStorage.removeItem(recoveryKey);

    const recover = (message: string) => {
      if (!shouldRecoverFromMessage(message)) return;
      if (window.sessionStorage.getItem(recoveryKey) === "1") return;
      window.sessionStorage.setItem(recoveryKey, "1");
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      recover(event.message ?? "");
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (typeof reason === "string") {
        recover(reason);
        return;
      }
      if (reason && typeof reason === "object" && "message" in reason && typeof reason.message === "string") {
        recover(reason.message);
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
