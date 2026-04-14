"use client";

import { useEffect, useState, useCallback } from "react";

import { RuntimeStatusBadge } from "@/components/runtime-status-badge";
import { LogoutButton } from "@/components/logout-button";
import { type Locale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

const STORAGE_KEYS = {
  DEMO_MODE: "platform-demo-mode-v1",
  DEFAULT_ROUNDS: "platform-default-rounds-v1",
  DEFAULT_BATCH_SIZE: "platform-default-batch-size-v1",
} as const;

interface SettingsClientProps {
  locale: Locale;
  initialUsername?: string | null;
}

export function SettingsClient({ locale, initialUsername }: SettingsClientProps) {
  const copy = WORKSPACE_COPY[locale].settings;

  const [demoMode, setDemoMode] = useState(false);
  const [defaultRounds, setDefaultRounds] = useState("10");
  const [defaultBatchSize, setDefaultBatchSize] = useState("32");
  const [savedMsg, setSavedMsg] = useState(false);
  const [username, setUsername] = useState<string | null>(initialUsername ?? null);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
      if (stored === "1") setDemoMode(true);
    } catch {}
    try {
      const rounds = window.localStorage.getItem(STORAGE_KEYS.DEFAULT_ROUNDS);
      if (rounds) setDefaultRounds(rounds);
    } catch {}
    try {
      const batch = window.localStorage.getItem(STORAGE_KEYS.DEFAULT_BATCH_SIZE);
      if (batch) setDefaultBatchSize(batch);
    } catch {}
  }, []);

  // Fetch current user
  useEffect(() => {
    if (initialUsername !== undefined) return;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3000);

    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          signal: controller.signal,
          credentials: "include",
        });
        if (res.ok) {
          const data = (await res.json()) as { username?: string };
          if (data.username) setUsername(data.username);
        }
      } catch {
        // Ignore errors — username stays null
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    void loadUser();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [initialUsername]);

  const showSaved = useCallback(() => {
    setSavedMsg(true);
    window.setTimeout(() => setSavedMsg(false), 2000);
  }, []);

  function handleDemoModeToggle(checked: boolean) {
    setDemoMode(checked);
    try {
      window.localStorage.setItem(STORAGE_KEYS.DEMO_MODE, checked ? "1" : "0");
    } catch {}
  }

  function handleRoundsChange(value: string) {
    setDefaultRounds(value);
    try {
      window.localStorage.setItem(STORAGE_KEYS.DEFAULT_ROUNDS, value);
    } catch {}
  }

  function handleBatchSizeChange(value: string) {
    setDefaultBatchSize(value);
    try {
      window.localStorage.setItem(STORAGE_KEYS.DEFAULT_BATCH_SIZE, value);
    } catch {}
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="border-b border-border pb-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {copy.eyebrow}
        </div>
        <h1 className="mt-1 text-lg font-semibold">{copy.title}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{copy.description}</p>
      </div>

      {/* Settings cards */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* System status */}
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.systemStatus.title}
            </h2>
          </div>
          <div className="p-3">
            {/* Runtime connection */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{copy.systemStatus.runtime}</span>
              <RuntimeStatusBadge locale={locale} />
            </div>

            {/* Demo mode toggle */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{copy.systemStatus.demoMode}</span>
              <button
                type="button"
                onClick={() => handleDemoModeToggle(!demoMode)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  demoMode
                    ? "bg-[color:var(--success)]"
                    : "bg-[color:var(--border)]"
                }`}
                aria-label={`${copy.systemStatus.demoMode}: ${demoMode ? copy.systemStatus.demoOn : copy.systemStatus.demoOff}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 translate-x-1 rounded-full bg-white shadow transition-transform ${
                    demoMode ? "translate-x-[1.125rem]" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Audit configuration */}
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.auditConfig.title}
            </h2>
            {savedMsg && (
              <span className="text-[10px] text-[color:var(--success)]">
                {copy.auditConfig.saved}
              </span>
            )}
          </div>
          <div className="p-3">
            {/* Default rounds */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {copy.auditConfig.defaultRounds}
              </label>
              <input
                type="number"
                value={defaultRounds}
                onChange={(e) => {
                  handleRoundsChange(e.target.value);
                  showSaved();
                }}
                min={1}
                max={1000}
                className="settings-input"
              />
            </div>

            {/* Default batch size */}
            <div className="mt-3 space-y-1">
              <label className="text-xs text-muted-foreground">
                {copy.auditConfig.defaultBatchSize}
              </label>
              <input
                type="number"
                value={defaultBatchSize}
                onChange={(e) => {
                  handleBatchSizeChange(e.target.value);
                  showSaved();
                }}
                min={1}
                max={1024}
                className="settings-input"
              />
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.account.title}
            </h2>
          </div>
          <div className="p-3">
            {/* Username */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">{copy.account.username}</span>
              {username ? (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--primary)]/10 text-[11px] font-semibold text-[color:var(--primary)]">
                    {username[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm font-medium">{username}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--border)]">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--muted-foreground)]" />
                  </div>
                  <span className="text-sm text-muted-foreground">—</span>
                </div>
              )}
            </div>

            {/* Logout */}
            <div className="mt-4">
              <LogoutButton label={copy.account.logout} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
