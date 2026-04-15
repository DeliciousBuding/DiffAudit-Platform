"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import { RuntimeStatusBadge } from "@/components/runtime-status-badge";
import { LogoutButton } from "@/components/logout-button";
import { type Locale, setStoredLocale, getStoredLocale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { useTheme } from "@/hooks/use-theme";

const STORAGE_KEYS = {
  DEMO_MODE: "platform-demo-mode-v1",
  DEFAULT_ROUNDS: "platform-default-rounds-v1",
  DEFAULT_BATCH_SIZE: "platform-default-batch-size-v1",
  RUNTIME_HOST: "platform-runtime-host-v1",
  RUNTIME_PORT: "platform-runtime-port-v1",
  THEME: "platform-theme-v1",
} as const;

type ThemeMode = "light" | "dark" | "system";

interface SettingsClientProps {
  locale: Locale;
  initialUsername?: string | null;
}

export function SettingsClient({ locale, initialUsername }: SettingsClientProps) {
  const copy = WORKSPACE_COPY[locale].settings;

  const [demoMode, setDemoMode] = useState(false);
  const [defaultRounds, setDefaultRounds] = useState("10");
  const [defaultBatchSize, setDefaultBatchSize] = useState("32");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(initialUsername ?? null);

  // Preferences
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);
  const [theme, setTheme] = useState<ThemeMode>("light");

  // Runtime config
  const [runtimeHost, setRuntimeHost] = useState("http://127.0.0.1");
  const [runtimePort, setRuntimePort] = useState("8765");
  const [runtimeTesting, setRuntimeTesting] = useState(false);
  const [runtimeConnected, setRuntimeConnected] = useState<boolean | null>(null);

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
    try {
      const host = window.localStorage.getItem(STORAGE_KEYS.RUNTIME_HOST);
      if (host) setRuntimeHost(host);
    } catch {}
    try {
      const port = window.localStorage.getItem(STORAGE_KEYS.RUNTIME_PORT);
      if (port) setRuntimePort(port);
    } catch {}
    try {
      const savedLocale = getStoredLocale();
      setCurrentLocale(savedLocale);
    } catch {}
    try {
      const savedTheme = window.localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
      if (savedTheme) {
        setTheme(savedTheme);
        const resolved = savedTheme === "system"
          ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
          : savedTheme;
        document.documentElement.setAttribute("data-theme", resolved);
        document.documentElement.classList.toggle("dark", resolved === "dark");
        document.documentElement.style.colorScheme = resolved;
      }
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

  const showSaved = useCallback((section?: string) => {
    setSavedMsg(section ?? copy.auditConfig.saved);
    window.setTimeout(() => setSavedMsg(null), 2000);
  }, [copy.auditConfig.saved]);

  function handleDemoModeToggle(checked: boolean) {
    setDemoMode(checked);
    try {
      window.localStorage.setItem(STORAGE_KEYS.DEMO_MODE, checked ? "1" : "0");
      // Set cookie so server components can detect demo mode
      document.cookie = `platform-demo-mode=${checked ? "1" : "0"}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
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

  function handleLocaleChange(newLocale: Locale) {
    setCurrentLocale(newLocale);
    try {
      setStoredLocale(newLocale);
    } catch {}
    showSaved(copy.preferences.language);
  }

  const themeListenerRef = useRef<{ mq: MediaQueryList; handler: (e: MediaQueryListEvent) => void } | null>(null);

  function handleThemeChange(newTheme: ThemeMode) {
    setTheme(newTheme);
    try {
      window.localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      const resolved = newTheme === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : newTheme;
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
      document.documentElement.style.colorScheme = resolved;

      // Remove old listener if switching away from system or switching again
      if (themeListenerRef.current) {
        themeListenerRef.current.mq.removeEventListener("change", themeListenerRef.current.handler);
        themeListenerRef.current = null;
      }

      // Listen for OS theme changes when "system" is selected
      if (newTheme === "system") {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent) => {
          const next = e.matches ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", next);
          document.documentElement.classList.toggle("dark", next === "dark");
          document.documentElement.style.colorScheme = next;
        };
        mq.addEventListener("change", handler);
        themeListenerRef.current = { mq, handler };
      }
    } catch {}
    showSaved(copy.preferences.theme);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (themeListenerRef.current) {
        themeListenerRef.current.mq.removeEventListener("change", themeListenerRef.current.handler);
      }
    };
  }, []);

  async function handleTestRuntime() {
    setRuntimeTesting(true);
    setRuntimeConnected(null);
    try {
      const url = `${runtimeHost}:${runtimePort}/health`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      setRuntimeConnected(res.ok);
    } catch {
      setRuntimeConnected(false);
    } finally {
      setRuntimeTesting(false);
    }
  }

  function handleSaveRuntimeHost(value: string) {
    setRuntimeHost(value);
    try {
      window.localStorage.setItem(STORAGE_KEYS.RUNTIME_HOST, value);
    } catch {}
  }

  function handleSaveRuntimePort(value: string) {
    setRuntimePort(value);
    try {
      window.localStorage.setItem(STORAGE_KEYS.RUNTIME_PORT, value);
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

      {/* Settings grid - organized by priority */}
      <div className="grid gap-3 lg:grid-cols-2">
        {/* System & Runtime - Combined */}
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.systemStatus.title}
            </h2>
          </div>
          <div className="p-3 space-y-3">
            {/* Runtime connection status */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs text-muted-foreground">{copy.systemStatus.runtime}</span>
              <RuntimeStatusBadge locale={locale} />
            </div>

            {/* Demo mode toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium">{copy.systemStatus.demoMode}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {demoMode ? copy.systemStatus.demoOn : copy.systemStatus.demoOff}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDemoModeToggle(!demoMode)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  demoMode ? "bg-[color:var(--success)]" : "bg-[color:var(--border)]"
                }`}
                aria-label={`${copy.systemStatus.demoMode}: ${demoMode ? copy.systemStatus.demoOn : copy.systemStatus.demoOff}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    demoMode ? "translate-x-[1.125rem]" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Runtime config */}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium">{copy.runtimeConfig.title}</h3>
                {savedMsg === copy.runtimeConfig.saved && (
                  <span className="text-[10px] text-[color:var(--success)]">{copy.runtimeConfig.saved}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{copy.runtimeConfig.host}</label>
                  <input
                    type="text"
                    value={runtimeHost}
                    onChange={(e) => handleSaveRuntimeHost(e.target.value)}
                    placeholder={copy.runtimeConfig.hostPlaceholder}
                    className="settings-input mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{copy.runtimeConfig.port}</label>
                  <input
                    type="text"
                    value={runtimePort}
                    onChange={(e) => handleSaveRuntimePort(e.target.value)}
                    className="settings-input mono text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestRuntime}
                  disabled={runtimeTesting}
                  className="flex-1 rounded-md bg-[color:var(--accent-blue)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {runtimeTesting ? copy.runtimeConfig.testing : copy.runtimeConfig.testConnection}
                </button>
                {runtimeConnected === true && (
                  <span className="text-[10px] text-[color:var(--success)]">{copy.runtimeConfig.connected}</span>
                )}
                {runtimeConnected === false && (
                  <span className="text-[10px] text-[color:var(--warning)]">{copy.runtimeConfig.disconnected}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Audit Configuration */}
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.auditConfig.title}
            </h2>
            {savedMsg === copy.auditConfig.saved && (
              <span className="text-[10px] text-[color:var(--success)]">{copy.auditConfig.saved}</span>
            )}
          </div>
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{copy.auditConfig.defaultRounds}</label>
                <input
                  type="number"
                  value={defaultRounds}
                  onChange={(e) => handleRoundsChange(e.target.value)}
                  onBlur={() => showSaved(copy.auditConfig.defaultRounds)}
                  min={1}
                  max={1000}
                  className="settings-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{copy.auditConfig.defaultBatchSize}</label>
                <input
                  type="number"
                  value={defaultBatchSize}
                  onChange={(e) => handleBatchSizeChange(e.target.value)}
                  onBlur={() => showSaved(copy.auditConfig.defaultBatchSize)}
                  min={1}
                  max={1024}
                  className="settings-input"
                />
              </div>
            </div>

            {/* Template save */}
            <div className="pt-3 border-t border-border">
              <div className="text-xs font-medium mb-1.5">{copy.auditTemplates.title}</div>
              <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{copy.auditTemplates.description}</p>
              <button
                onClick={() => {
                  try {
                    const template = {
                      rounds: defaultRounds,
                      batchSize: defaultBatchSize,
                      createdAt: new Date().toISOString(),
                    };
                    window.localStorage.setItem("platform-audit-template-default", JSON.stringify(template));
                    showSaved(copy.auditTemplates.saved);
                  } catch {}
                }}
                className="w-full rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
              >
                {copy.auditTemplates.saveCurrent}
              </button>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.preferences.title}
            </h2>
          </div>
          <div className="p-3 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">{copy.preferences.language}</label>
              <p className="text-xs text-muted-foreground leading-snug">{copy.preferences.languageNote}</p>
              <div className="flex gap-1.5">
                {(["zh-CN", "en-US"] as Locale[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLocaleChange(l)}
                    className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                      currentLocale === l
                        ? "bg-[color:var(--accent-blue)]/10 text-[color:var(--accent-blue)]"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    {l === "zh-CN" ? "中文" : "English"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-border">
              <label className="text-xs font-medium">{copy.preferences.theme}</label>
              <div className="flex gap-1.5">
                {([
                  { key: "light" as const, label: copy.preferences.themeLight },
                  { key: "dark" as const, label: copy.preferences.themeDark },
                  { key: "system" as const, label: copy.preferences.themeSystem },
                ]).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => handleThemeChange(t.key)}
                    className={`flex-1 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      theme === t.key
                        ? "bg-[color:var(--accent-blue)]/10 text-[color:var(--accent-blue)]"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.account.title}
            </h2>
          </div>
          <div className="p-3">
            <div className="space-y-1 mb-4">
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
            <LogoutButton label={copy.account.logout} />
          </div>
        </section>
      </div>

      {/* About System - Full width */}
      <section className="border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-3 py-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {copy.aboutSystem.title}
          </h2>
        </div>
        <div className="p-3">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Use cases */}
            <div>
              <h3 className="text-xs font-semibold mb-2">{copy.aboutSystem.useCases}</h3>
              <div className="grid gap-2">
                {copy.aboutSystem.useCaseItems.map((item) => (
                  <div key={item.title} className="rounded border border-border bg-muted/10 px-2.5 py-2">
                    <div className="text-xs font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Framework & Boundary */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-semibold mb-2">{copy.aboutSystem.framework}</h3>
                <div className="space-y-2">
                  {copy.aboutSystem.frameworkItems.map((item, i) => (
                    <div key={item.tier} className="rounded border border-border px-2.5 py-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                          i === 0 ? "bg-[var(--accent-blue)]" : i === 1 ? "bg-[var(--warning)]" : "bg-[var(--accent-coral)]"
                        }`} />
                        <span className="text-xs font-medium">{item.tier}</span>
                      </div>
                      <div className="text-xs text-muted-foreground leading-snug">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold mb-1.5">{copy.aboutSystem.systemBoundary}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-[var(--accent-blue)] pl-2">
                  {copy.aboutSystem.boundaryNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
