"use client";

import { useEffect, useRef, useState } from "react";

import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

type WorkspaceStatusDrawerProps = {
  locale: Locale;
  dataMode: "demo" | "live";
};

type GatewayHealth = {
  snapshot_available?: boolean;
  build?: {
    revision?: string;
  };
};

export function WorkspaceStatusDrawer({ locale, dataMode }: WorkspaceStatusDrawerProps) {
  const copy = WORKSPACE_COPY[locale].shell;
  const [open, setOpen] = useState(false);
  const [health, setHealth] = useState<GatewayHealth | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHealth() {
      try {
        const response = await fetch("/health", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          return;
        }
        setHealth((await response.json()) as GatewayHealth);
      } catch {
        // Status details are best-effort; the Runtime badge carries connectivity.
      }
    }

    void loadHealth();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const snapshotReady = health?.snapshot_available === true;
  const revision = health?.build?.revision;
  const buildLabel = revision ? revision.slice(0, 12) : copy.statusUnknown;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="workspace-status-trigger btn-reset"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={copy.statusTrigger}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="workspace-status-dot" aria-hidden="true" />
        <span>{copy.statusTrigger}</span>
      </button>
      {open ? (
        <div className="workspace-status-panel" role="dialog" aria-label={copy.statusTitle}>
          <div className="grid gap-1">
            <div className="text-sm font-semibold text-foreground">{copy.statusTitle}</div>
            <p className="m-0 text-xs leading-5 text-muted-foreground">{copy.statusDescription}</p>
          </div>
          <dl className="workspace-status-list">
            <div>
              <dt>{copy.statusDataMode}</dt>
              <dd>
                <StatusBadge tone={dataMode === "demo" ? "info" : "success"} compact>
                  {dataMode === "demo" ? copy.demoMode : copy.liveMode}
                </StatusBadge>
              </dd>
            </div>
            <div>
              <dt>{copy.statusSnapshot}</dt>
              <dd>
                <StatusBadge tone={snapshotReady ? "success" : "warning"} compact>
                  {snapshotReady ? copy.statusReady : copy.statusMissing}
                </StatusBadge>
              </dd>
            </div>
            <div>
              <dt>{copy.statusBuild}</dt>
              <dd>
                <span className="font-mono text-[11px] text-muted-foreground" title={revision ?? copy.statusUnknown}>
                  {buildLabel}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
