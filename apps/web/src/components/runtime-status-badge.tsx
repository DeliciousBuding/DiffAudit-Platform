"use client";

import { useEffect, useState } from "react";

import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

type RuntimeHealthResponse = {
  connected?: boolean;
  demo_mode?: boolean;
  detail?: string;
};

export function RuntimeStatusBadge({ locale = "en-US" }: { locale?: Locale }) {
  const copy = WORKSPACE_COPY[locale].shell;
  const [state, setState] = useState<"checking" | "connected" | "disconnected" | "demo">("checking");
  const [detail, setDetail] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 2000);

    async function load() {
      try {
        const response = await fetch("/api/v1/control/runtime", {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => null)) as RuntimeHealthResponse | null;
        if (payload?.demo_mode) {
          setState("demo");
          setDetail(payload?.detail ?? "");
          return;
        }
        const connected = payload?.connected === true;
        setState(connected ? "connected" : "disconnected");
        setDetail(payload?.detail ?? "");
      } catch (error) {
        setState("disconnected");
        setDetail(error instanceof Error ? error.message : "request failed");
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    void load();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  if (state === "checking") {
    return <StatusBadge tone="info">{copy.runtimeChecking}</StatusBadge>;
  }

  if (state === "connected") {
    return <StatusBadge tone="success">{copy.runtimeConnected}</StatusBadge>;
  }

  if (state === "demo") {
    return null;
  }

  return (
    <StatusBadge tone="warning">
      <span title={detail || copy.runtimeDisconnected}>{copy.runtimeDisconnected}</span>
    </StatusBadge>
  );
}
