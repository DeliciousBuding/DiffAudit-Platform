"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";

import { ProviderIcon } from "@/components/auth-icons";
import { RuntimeStatusBadge } from "@/components/runtime-status-badge";
import { LogoutButton } from "@/components/logout-button";
import { StatusBadge } from "@/components/status-badge";
import { type Locale } from "@/components/language-picker";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import type { CurrentUserProfile } from "@/lib/auth";
import { setDemoModeClient } from "@/lib/demo-mode-client";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

const STORAGE_KEYS = {
  DEMO_MODE: "platform-demo-mode-v1",
  DEFAULT_ROUNDS: "platform-default-rounds-v1",
  DEFAULT_BATCH_SIZE: "platform-default-batch-size-v1",
  RUNTIME_HOST: "platform-runtime-host-v1",
  RUNTIME_PORT: "platform-runtime-port-v1",
} as const;

type EmailVerificationStatus = "1" | "missing" | "invalid" | "expired" | "missing_pending_email";
type ProviderLinkStatus =
  | "google_connected"
  | "google_already_connected"
  | "google_in_use"
  | "github_connected"
  | "github_already_connected"
  | "github_in_use";
type EmailVerificationNotice = {
  tone: "success" | "error";
  message: string;
};
type SettingsMode = "settings" | "account";
type GatewayHealth = {
  snapshot_available?: boolean;
  runtime_configured?: boolean;
  build?: {
    revision?: string;
    date?: string;
  };
};

function formatProviderName(provider: string) {
  if (provider === "google") return "Google";
  if (provider === "github") return "GitHub";
  return provider;
}

function getEmailVerificationNotice(
  status: EmailVerificationStatus | null | undefined,
  copy: typeof WORKSPACE_COPY["en-US"]["settings"]["account"],
): EmailVerificationNotice | null {
  switch (status) {
    case "1":
      return { tone: "success", message: copy.verificationSuccess };
    case "missing":
      return { tone: "error", message: copy.verificationMissing };
    case "invalid":
      return { tone: "error", message: copy.verificationInvalid };
    case "expired":
      return { tone: "error", message: copy.verificationExpired };
    case "missing_pending_email":
      return { tone: "error", message: copy.verificationMissingPending };
    default:
      return null;
  }
}

function getProviderLinkNotice(
  status: ProviderLinkStatus | null | undefined,
  copy: typeof WORKSPACE_COPY["en-US"]["settings"]["account"],
): EmailVerificationNotice | null {
  switch (status) {
    case "google_connected":
      return { tone: "success", message: copy.providerLinkedGoogle };
    case "google_already_connected":
      return { tone: "success", message: copy.providerAlreadyLinkedGoogle };
    case "google_in_use":
      return { tone: "error", message: copy.providerInUseGoogle };
    case "github_connected":
      return { tone: "success", message: copy.providerLinkedGithub };
    case "github_already_connected":
      return { tone: "success", message: copy.providerAlreadyLinkedGithub };
    case "github_in_use":
      return { tone: "error", message: copy.providerInUseGithub };
    default:
      return null;
  }
}

function getAccessSummary(
  profile: CurrentUserProfile | null,
  copy: typeof WORKSPACE_COPY["en-US"]["settings"]["account"],
) {
  if (!profile) {
    return copy.accessSummaryNoProvider;
  }

  const methodLabels = profile.providers.map(formatProviderName);
  if (profile.hasPassword) {
    methodLabels.push(copy.password);
  }

  const separator = copy.accessSummaryPrefix.endsWith("：") || copy.accessSummaryPrefix.endsWith(":")
    ? ""
    : ".";
  const summary = methodLabels.length
    ? [`${copy.accessSummaryPrefix} ${methodLabels.join(" / ")}${separator}`]
    : [copy.accessSummaryNoProvider];
  summary.push(profile.hasPassword ? copy.accessSummaryPasswordOn : copy.accessSummaryPasswordOff);

  if (profile.pendingEmail) {
    summary.push(copy.accessSummaryPendingEmail);
  }

  return summary.join(" ");
}

interface SettingsClientProps {
  locale: Locale;
  initialDemoMode?: boolean;
  demoModeLocked?: boolean;
  initialProfile?: CurrentUserProfile | null;
  initialEmailVerificationStatus?: EmailVerificationStatus | null;
  initialProviderLinkStatus?: ProviderLinkStatus | null;
  oauthEnabled: { google: boolean; github: boolean };
  mode?: SettingsMode;
}

export function SettingsClient({
  locale,
  initialDemoMode = false,
  demoModeLocked = false,
  initialProfile,
  initialEmailVerificationStatus,
  initialProviderLinkStatus,
  oauthEnabled,
  mode = "settings",
}: SettingsClientProps) {
  const localeCopy = WORKSPACE_COPY[locale];
  const copy = localeCopy.settings;
  const shellCopy = localeCopy.shell;
  const router = useRouter();
  const isAccountMode = mode === "account";
  const pageEyebrow = isAccountMode ? copy.account.title : copy.eyebrow;
  const pageTitle = isAccountMode ? copy.account.title : copy.title;
  const pageDescription = isAccountMode ? copy.account.securityNote : copy.description;

  const [demoMode, setDemoMode] = useState(initialDemoMode);
  const [defaultRounds, setDefaultRounds] = useState("10");
  const [defaultBatchSize, setDefaultBatchSize] = useState("32");
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(initialProfile ?? null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordEditor, setShowPasswordEditor] = useState(false);
  const [emailInput, setEmailInput] = useState(initialProfile?.pendingEmail ?? initialProfile?.email ?? "");
  const [emailPending, setEmailPending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);
  const [emailVerificationNotice, setEmailVerificationNotice] = useState<EmailVerificationNotice | null>(
    getEmailVerificationNotice(initialEmailVerificationStatus, copy.account),
  );
  const [providerLinkNotice, setProviderLinkNotice] = useState<EmailVerificationNotice | null>(
    getProviderLinkNotice(initialProviderLinkStatus, copy.account),
  );

  // Runtime config
  const [runtimeHost, setRuntimeHost] = useState("http://127.0.0.1");
  const [runtimePort, setRuntimePort] = useState("8765");
  const [runtimeTesting, setRuntimeTesting] = useState(false);
  const [runtimeConnected, setRuntimeConnected] = useState<boolean | null>(null);
  const [gatewayHealth, setGatewayHealth] = useState<GatewayHealth | null>(null);

  // Load from localStorage
  useEffect(() => {
    if (demoModeLocked) {
      setDemoMode(true);
      return;
    }
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
  }, [demoModeLocked]);

  // Fetch current user
  useEffect(() => {
    if (initialProfile !== undefined) return;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3000);

    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          signal: controller.signal,
          credentials: "include",
        });
        if (res.ok) {
          const data = (await res.json()) as { user?: CurrentUserProfile | null };
          if (data.user) setProfile(data.user);
        }
      } catch {
        // Ignore errors — profile stays null
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    void loadUser();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [initialProfile]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3000);

    async function loadGatewayHealth() {
      try {
        const response = await fetch("/health", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = (await response.json().catch(() => null)) as GatewayHealth | null;
        setGatewayHealth(payload);
      } catch {
        setGatewayHealth(null);
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    void loadGatewayHealth();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const showSaved = useCallback((section: string) => {
    setSavedSection(section);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = window.setTimeout(() => setSavedSection(null), 2000);
  }, []);

  function handleDemoModeToggle(checked: boolean) {
    if (demoModeLocked && !checked) {
      setDemoMode(true);
      return;
    }
    setDemoMode(checked);
    setDemoModeClient(checked);
    router.refresh();
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
      showSaved("runtime");
    } catch {}
  }

  function handleSaveRuntimePort(value: string) {
    setRuntimePort(value);
    try {
      window.localStorage.setItem(STORAGE_KEYS.RUNTIME_PORT, value);
      showSaved("runtime");
    } catch {}
  }

  async function handlePasswordSave() {
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError(copy.account.passwordTooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(copy.account.passwordMismatch);
      return;
    }

    setPasswordPending(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          password: newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setPasswordError(payload?.message ?? copy.account.passwordTooShort);
        return;
      }

      setProfile((prev) => (prev ? { ...prev, hasPassword: true } : prev));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordEditor(false);
      showSaved("account");
    } catch {
      setPasswordError(copy.account.passwordSaveFailed);
    } finally {
      setPasswordPending(false);
    }
  }

  async function handleEmailSave() {
    setEmailPending(true);
    setEmailError(null);
    setEmailVerificationNotice(null);
    setProviderLinkNotice(null);
    setVerificationUrl(null);
    setShowVerificationDetails(false);

    try {
      const response = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: emailInput }),
      });
      const payload = (await response.json().catch(() => null)) as {
        pendingEmail?: string;
        message?: string;
      } | null;
      const pendingEmail = payload?.pendingEmail;

      if (!response.ok || typeof pendingEmail !== "string") {
        if (response.status === 400) {
          setEmailError(payload?.message ?? copy.account.emailInvalid);
        } else if (response.status === 409) {
          setEmailError(payload?.message ?? copy.account.emailInUse);
        } else {
          setEmailError(payload?.message ?? copy.account.verificationRequestFailed);
        }
        return;
      }

      setProfile((prev) => (prev ? { ...prev, pendingEmail } : prev));
      setShowEmailEditor(false);
      setEmailVerificationNotice({
        tone: "success",
        message: copy.account.emailSaved,
      });
    } catch {
      setEmailError(copy.account.verificationRequestFailed);
    } finally {
      setEmailPending(false);
    }
  }

  async function handleGenerateVerificationLink() {
    setVerificationPending(true);
    setEmailError(null);
    setProviderLinkNotice(null);
    try {
      const response = await fetch("/api/auth/email-verification", {
        method: "POST",
        credentials: "include",
      });
      const payload = (await response.json().catch(() => null)) as {
        verificationUrl?: string;
        message?: string;
      } | null;

      if (!response.ok || !payload?.verificationUrl) {
        setEmailVerificationNotice({
          tone: "error",
          message: payload?.message ?? copy.account.verificationRequestFailed,
        });
        return;
      }

      setVerificationUrl(payload.verificationUrl);
      setShowVerificationDetails(false);
      setEmailVerificationNotice({
        tone: "success",
        message: copy.account.verificationLinkReady,
      });
    } catch {
      setEmailVerificationNotice({
        tone: "error",
        message: copy.account.verificationRequestFailed,
      });
    } finally {
      setVerificationPending(false);
    }
  }

  async function handleCopyVerificationLink() {
    if (!verificationUrl) return;
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setEmailVerificationNotice({
        tone: "success",
        message: copy.account.verificationLinkCopied,
      });
    } catch {
      setEmailVerificationNotice({
        tone: "error",
        message: copy.account.verificationRequestFailed,
      });
    }
  }

  const connectedProviders = profile?.providers ?? [];
  const availableProviderConnectors = ([
    { key: "google", label: copy.account.connectGoogle },
    { key: "github", label: copy.account.connectGithub },
  ] as const).filter((provider) => oauthEnabled[provider.key] && !connectedProviders.includes(provider.key));
  const accessSummary = getAccessSummary(profile, copy.account);

  return (
    <WorkspacePageFrame
      eyebrow={pageEyebrow}
      title={pageTitle}
      description={pageDescription}
      titleClassName="text-lg"
      descriptionClassName="text-xs"
    >
      <div className={`grid gap-3 ${isAccountMode ? "" : "lg:grid-cols-3"}`}>
        {!isAccountMode ? (
          <>
        {/* About System — 置顶，作为设置入口的系统说明 */}
        <section className="order-1 border border-border bg-card lg:col-span-2">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.aboutSystem.title}
            </h2>
          </div>
          <div className="p-3 space-y-4">
            <div>
              <h3 className="mb-2 text-xs font-medium">{copy.aboutSystem.useCases}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {copy.aboutSystem.useCaseItems.map((item) => (
                  <div key={item.title} className="rounded border border-border bg-muted/10 px-2.5 py-2">
                    <div className="text-xs font-medium">{item.title}</div>
                    <div className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-1.5 text-xs font-medium">{copy.aboutSystem.systemBoundary}</h3>
              <p className="border-l-2 border-[var(--accent-blue)] pl-2 text-[10px] leading-relaxed text-muted-foreground">
                {copy.aboutSystem.boundaryNote}
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium">{copy.aboutSystem.framework}</h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {copy.aboutSystem.frameworkItems.map((item, index) => (
                  <div key={item.tier} className="rounded border border-border px-2.5 py-2">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          index === 0
                            ? "bg-[var(--accent-blue)]"
                            : index === 1
                              ? "bg-[var(--warning)]"
                              : "bg-[var(--accent-coral)]"
                        }`}
                      />
                      <span className="text-xs font-medium">{item.tier}</span>
                    </div>
                    <div className="text-[10px] leading-relaxed text-muted-foreground">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* System status */}
        <section className="order-2 border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.systemStatus.title}
            </h2>
          </div>
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{copy.systemStatus.runtime}</span>
              <RuntimeStatusBadge locale={locale} />
            </div>
            <div className="rounded-[14px] border border-border bg-muted/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">{copy.systemStatus.snapshot}</span>
                <StatusBadge tone={gatewayHealth?.snapshot_available ? "success" : "warning"} compact>
                  {gatewayHealth?.snapshot_available ? copy.systemStatus.snapshotReady : copy.systemStatus.snapshotMissing}
                </StatusBadge>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">{copy.systemStatus.build}</span>
                <span className="max-w-[12rem] truncate font-mono text-[10px] text-muted-foreground" title={gatewayHealth?.build?.revision ?? copy.systemStatus.unknown}>
                  {gatewayHealth?.build?.revision?.slice(0, 12) ?? copy.systemStatus.unknown}
                </span>
              </div>
            </div>

            <div className="rounded-[18px] border border-border bg-muted/10 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                <span className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full ${
                  demoMode
                    ? "bg-[color:var(--accent-blue)]/14 text-[color:var(--accent-blue)]"
                    : "bg-muted/20 text-muted-foreground"
                }`}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path d="M5 7.5h14M8 5v5M16 5v5M6 11h12l-1 7H7l-1-7Z" />
                    <path d="M10 14.5h4" />
                  </svg>
                </span>
                <div>
                  <div className="text-xs font-medium text-foreground">{copy.systemStatus.demoMode}</div>
                  <div className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    {demoMode ? copy.systemStatus.demoOn : copy.systemStatus.demoOff}
                  </div>
                </div>
              </div>
                <StatusBadge tone={demoMode ? "info" : "neutral"} compact>
                  {demoMode ? copy.systemStatus.demoOn : copy.systemStatus.demoOff}
                </StatusBadge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-border bg-background/70 p-1">
                <button
                  type="button"
                  onClick={() => handleDemoModeToggle(false)}
                  aria-pressed={!demoMode}
                  disabled={demoModeLocked}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    !demoMode
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/20"
                  } ${demoModeLocked ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {shellCopy.liveMode}
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoModeToggle(true)}
                  aria-pressed={demoMode}
                  disabled={demoModeLocked}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    demoMode
                      ? "bg-[color:var(--accent-blue)] text-white shadow-sm"
                      : "text-muted-foreground hover:bg-muted/20"
                  } ${demoModeLocked ? "cursor-not-allowed opacity-90" : ""}`}
                >
                  {shellCopy.demoMode}
                </button>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                {demoMode ? copy.systemStatus.demoHintOn : copy.systemStatus.demoHintOff}
              </p>
            </div>
          </div>
        </section>

        {/* Audit configuration */}
        <section className="order-4 border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.auditConfig.title}
            </h2>
            {savedSection === "audit" && (
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
                onChange={(e) => handleRoundsChange(e.target.value)}
                onBlur={() => showSaved("audit")}
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
                onChange={(e) => handleBatchSizeChange(e.target.value)}
                onBlur={() => showSaved("audit")}
                min={1}
                max={1024}
                className="settings-input"
              />
            </div>
          </div>
        </section>

        {/* Runtime Connection — 2.2.2 */}
        <section className="order-3 border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.runtimeConfig.title}
            </h2>
            {savedSection === "runtime" && (
              <span className="text-[10px] text-[color:var(--success)]">
                {copy.runtimeConfig.saved}
              </span>
            )}
          </div>
          <div className="p-3 space-y-3">
            {/* Host */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {copy.runtimeConfig.host}
              </label>
              <input
                type="text"
                value={runtimeHost}
                onChange={(e) => handleSaveRuntimeHost(e.target.value)}
                placeholder={copy.runtimeConfig.hostPlaceholder}
                className="settings-input mono"
              />
            </div>

            {/* Port */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {copy.runtimeConfig.port}
              </label>
              <input
                type="text"
                value={runtimePort}
                onChange={(e) => handleSaveRuntimePort(e.target.value)}
                className="settings-input mono"
              />
            </div>

            {/* Test connection */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestRuntime}
                disabled={runtimeTesting}
                className="workspace-btn-primary flex-1 px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-50"
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
        </section>

        {/* Audit Templates — 2.2.3 */}
        <section className="order-5 border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.auditTemplates.title}
            </h2>
          </div>
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-3">
              {copy.auditTemplates.description}
            </p>
            <button
              onClick={() => {
                try {
                  const template = {
                    rounds: defaultRounds,
                    batchSize: defaultBatchSize,
                    createdAt: new Date().toISOString(),
                  };
                  window.localStorage.setItem(
                    "platform-audit-template-default",
                    JSON.stringify(template)
                  );
                  showSaved("templates");
                } catch {}
              }}
              className="workspace-btn-secondary w-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {copy.auditTemplates.saveCurrent}
            </button>
          </div>
        </section>
          </>
        ) : null}

        {isAccountMode ? (
        <section className="border border-border bg-card">
          <div className="border-b border-border bg-muted/20 px-3 py-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.account.title}
            </h2>
          </div>
          <div className="grid gap-4 p-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            {/* Username with avatar */}
            <div className="space-y-3">
              <span className="text-xs text-muted-foreground">{copy.account.username}</span>
              {profile ? (
                <>
                  <div className="flex items-center gap-3 rounded-[22px] border border-border bg-[linear-gradient(180deg,rgba(47,109,246,0.08),rgba(47,109,246,0.02))] p-4">
                    <div
                      className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-[color:var(--primary)]/10 text-sm font-semibold text-[color:var(--primary)]"
                      style={
                        profile.avatarUrl
                          ? {
                              backgroundImage: `url(${profile.avatarUrl})`,
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                            }
                          : undefined
                      }
                      aria-label={profile.displayName}
                    >
                      {profile.avatarUrl ? null : profile.displayName[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold">{profile.displayName}</div>
                      <div className="truncate text-xs text-muted-foreground">@{profile.username}</div>
                      <div className="mt-1 text-[11px] leading-5 text-muted-foreground">{accessSummary}</div>
                    </div>
                  </div>
                  <div className="space-y-1 rounded-[18px] border border-border bg-card p-4">
                    <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      {copy.account.email}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span>{profile.email ?? copy.account.noEmail}</span>
                      {profile.email ? (
                        <span className="inline-flex items-center rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                          {profile.emailVerified ? copy.account.verified : copy.account.unverified}
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEmailEditor((current) => !current);
                          setEmailError(null);
                          setEmailInput(profile.pendingEmail ?? profile.email ?? "");
                        }}
                        className="workspace-btn-secondary px-3 py-2 text-xs font-medium"
                      >
                        {profile.email || profile.pendingEmail ? copy.account.changeEmail : copy.account.addEmail}
                      </button>
                    </div>
                  </div>
                  {showEmailEditor ? (
                    <div className="space-y-3 rounded-[14px] border border-border bg-card p-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground" htmlFor="settings-email">
                          {copy.account.email}
                        </label>
                        <input
                          id="settings-email"
                          type="email"
                          className="settings-input"
                          value={emailInput}
                          onChange={(event) => setEmailInput(event.target.value)}
                          placeholder={copy.account.emailPlaceholder}
                        />
                      </div>
                      {emailError ? (
                        <p className="text-[11px] text-[#bf2f2f]">{emailError}</p>
                      ) : null}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleEmailSave}
                          disabled={emailPending}
                          className="workspace-btn-primary flex-1 px-3 py-2 text-xs font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {emailPending ? copy.account.savingEmail : copy.account.saveEmail}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowEmailEditor(false);
                            setEmailError(null);
                            setEmailInput(profile.pendingEmail ?? profile.email ?? "");
                          }}
                          className="workspace-btn-secondary px-3 py-2 text-xs font-medium"
                        >
                          {copy.account.cancelEmailEdit}
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {profile.pendingEmail ? (
                    <div className="space-y-3 rounded-[14px] border border-border bg-muted/10 p-3">
                      <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                        {copy.account.pendingEmail}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {profile.pendingEmail}
                          <span className="ml-2 text-[11px] text-muted-foreground">
                            {copy.account.unverified}
                          </span>
                        </div>
                        <p className="text-[11px] leading-5 text-muted-foreground">
                          {copy.account.pendingEmailNote}
                        </p>
                        <p className="text-[11px] leading-5 text-muted-foreground">
                          {copy.account.verificationWorkspaceMode}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleGenerateVerificationLink}
                          disabled={verificationPending}
                          className="workspace-btn-primary px-3 py-2 text-xs font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {verificationPending
                            ? copy.account.generatingVerificationLink
                            : copy.account.generateVerificationLink}
                        </button>
                        {verificationUrl ? (
                            <button
                              type="button"
                              onClick={() => setShowVerificationDetails((current) => !current)}
                              className="workspace-btn-secondary px-3 py-2 text-xs font-medium"
                            >
                              {showVerificationDetails
                                ? copy.account.hideVerificationDetails
                                : copy.account.showVerificationDetails}
                            </button>
                        ) : null}
                      </div>
                      {verificationUrl ? (
                        <a
                          href={verificationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-md bg-[color:var(--accent-blue)]/10 px-3 py-2 text-xs font-medium text-[color:var(--accent-blue)] transition-colors hover:bg-[color:var(--accent-blue)]/15"
                        >
                          {copy.account.openVerificationLink}
                        </a>
                      ) : null}
                      {verificationUrl && showVerificationDetails ? (
                        <div className="space-y-2 rounded-md border border-border bg-card p-3">
                          <button
                            type="button"
                            onClick={handleCopyVerificationLink}
                            className="workspace-btn-secondary px-3 py-2 text-xs font-medium"
                          >
                            {copy.account.copyVerificationLink}
                          </button>
                          <div className="rounded-md border border-border bg-muted/10 px-3 py-2 font-mono text-[11px] text-muted-foreground break-all">
                            {verificationUrl}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {emailVerificationNotice ? (
                    <div
                      className={`rounded-[14px] border px-3 py-2 text-[11px] leading-5 ${
                        emailVerificationNotice.tone === "success"
                          ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                          : "border-[#bf2f2f]/20 bg-[#bf2f2f]/8 text-[#bf2f2f]"
                      }`}
                    >
                      {emailVerificationNotice.message}
                    </div>
                  ) : null}
                  {providerLinkNotice ? (
                    <div
                      className={`rounded-[14px] border px-3 py-2 text-[11px] leading-5 ${
                        providerLinkNotice.tone === "success"
                          ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                          : "border-[#bf2f2f]/20 bg-[#bf2f2f]/8 text-[#bf2f2f]"
                      }`}
                    >
                      {providerLinkNotice.message}
                    </div>
                  ) : null}
                  <p className="text-[11px] leading-5 text-muted-foreground">
                    {copy.account.securityNote}{" "}
                    <Link href="/docs/privacy" className="auth-inline-link">{copy.account.privacy}</Link>
                    {" · "}
                    <Link href="/docs/terms" className="auth-inline-link">{copy.account.terms}</Link>
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--border)]">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--muted-foreground)]" />
                  </div>
                  <span className="text-sm text-muted-foreground">—</span>
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-[22px] border border-border bg-muted/10 p-4">
              <div className="space-y-1 rounded-[16px] border border-border bg-card p-3">
                <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  {copy.account.accessSummary}
                </div>
                <p className="text-sm leading-6 text-foreground">{accessSummary}</p>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  {copy.account.providers}
                </div>
                <div className="flex flex-wrap gap-2">
                  {connectedProviders.length ? connectedProviders.map((provider) => (
                    <span
                      key={provider}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold"
                    >
                      {provider === "google" ? <ProviderIcon provider="google" className="h-3.5 w-3.5" /> : null}
                      {provider === "github" ? <ProviderIcon provider="github" className="h-3.5 w-3.5" /> : null}
                      <span className="capitalize">{provider}</span>
                    </span>
                  )) : (
                    <span className="text-sm text-muted-foreground">{copy.account.accessSummaryNoProvider}</span>
                  )}
                </div>
              </div>
              {availableProviderConnectors.length ? (
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {copy.account.accessSummary}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableProviderConnectors.map((provider) => (
                      <a
                        key={provider.key}
                        href={`/api/auth/${provider.key}?intent=connect&redirectTo=${encodeURIComponent("/workspace/account")}`}
                        className="workspace-btn-secondary px-3 py-2 text-xs font-medium"
                      >
                        <ProviderIcon provider={provider.key} className="h-4 w-4" />
                        <span>{provider.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {copy.account.password}
                  </div>
                  <div className="text-sm">
                    {profile?.hasPassword ? copy.account.passwordSet : copy.account.passwordUnset}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {copy.account.loginId}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {profile?.hasPassword
                      ? `@${profile.username}${profile.email ? ` / ${profile.email}` : ""}`
                      : copy.account.loginIdPending}
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-3">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {copy.account.passwordManage}
                  </div>
                  <p className="text-[11px] leading-5 text-muted-foreground">
                    {profile?.hasPassword ? copy.account.passwordHintExisting : copy.account.passwordHintNew}
                  </p>
                </div>

                {!showPasswordEditor ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordError(null);
                      setShowPasswordEditor(true);
                    }}
                    className="workspace-btn-secondary w-full px-3 py-2 text-xs font-medium"
                  >
                    {profile?.hasPassword ? copy.account.openPasswordChange : copy.account.openPasswordCreate}
                  </button>
                ) : (
                  <div className="space-y-3 rounded-[14px] border border-border bg-card p-3">
                    {profile?.hasPassword ? (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground" htmlFor="settings-current-password">
                          {copy.account.currentPassword}
                        </label>
                        <input
                          id="settings-current-password"
                          type="password"
                          className="settings-input"
                          value={currentPassword}
                          onChange={(event) => setCurrentPassword(event.target.value)}
                          placeholder={copy.account.currentPasswordPlaceholder}
                        />
                      </div>
                    ) : null}

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground" htmlFor="settings-new-password">
                        {copy.account.newPassword}
                      </label>
                      <input
                        id="settings-new-password"
                        type="password"
                        className="settings-input"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder={copy.account.newPasswordPlaceholder}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground" htmlFor="settings-confirm-password">
                        {copy.account.confirmPassword}
                      </label>
                      <input
                        id="settings-confirm-password"
                        type="password"
                        className="settings-input"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder={copy.account.confirmPasswordPlaceholder}
                      />
                    </div>

                    {passwordError ? (
                      <p className="text-[11px] text-[#bf2f2f]">{passwordError}</p>
                    ) : null}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handlePasswordSave}
                        disabled={passwordPending}
                        className="workspace-btn-primary flex-1 px-3 py-2 text-xs font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {passwordPending ? copy.account.savingPassword : copy.account.savePassword}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordEditor(false);
                          setPasswordError(null);
                        }}
                        className="workspace-btn-secondary px-3 py-2 text-xs font-medium"
                      >
                        {copy.account.closePasswordEditor}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <LogoutButton label={copy.account.logout} />
              </div>
            </div>
          </div>
        </section>
        ) : null}
      </div>
    </WorkspacePageFrame>
  );
}
