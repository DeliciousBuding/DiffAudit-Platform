"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Info, Key, Plus } from "lucide-react";

import { type Locale } from "@/components/language-picker";
import { CopyButton } from "@/components/copy-button";
import { EmptyState } from "@/components/empty-state";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import { useToast } from "@/components/toast-provider";
import { formatDateOnly } from "@/lib/format";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string | null;
  scopes: string[];
  status: "active" | "revoked";
}

const MOCK_KEYS: ApiKey[] = [
  {
    id: "key_1",
    name: "Production Audit Runner",
    prefix: "da_demo_7kX3...mQ9p",
    created: "2026-03-28",
    lastUsed: "2026-04-15",
    scopes: ["audit:read", "audit:write", "results:read"],
    status: "active",
  },
  {
    id: "key_2",
    name: "CI/CD Pipeline",
    prefix: "da_demo_9bR1...hT4w",
    created: "2026-04-02",
    lastUsed: "2026-04-14",
    scopes: ["audit:write", "results:read"],
    status: "active",
  },
  {
    id: "key_3",
    name: "Research Notebook",
    prefix: "da_test_2fL8...nK6j",
    created: "2026-02-15",
    lastUsed: null,
    scopes: ["results:read"],
    status: "revoked",
  },
];

const ALL_SCOPES = ["audit:read", "audit:write", "results:read", "results:export", "admin"] as const;

const DEFAULT_SCOPES: string[] = ["audit:read", "audit:write", "results:read", "results:export"];

let demoIdCounter = 0;

function randomDemoToken(bytes = 12) {
  const values = new Uint8Array(bytes);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
  } else {
    demoIdCounter += 1;
    values.set(new TextEncoder().encode(`demo-${Date.now()}-${demoIdCounter}`).slice(0, bytes));
  }
  return Array.from(values, (value) => value.toString(36).padStart(2, "0")).join("").slice(0, 18);
}

function createDemoId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  demoIdCounter += 1;
  return `demo-key-${Date.now()}-${demoIdCounter}`;
}

export function ApiKeysClient({ locale }: { locale: Locale }) {
  const copy = WORKSPACE_COPY[locale].apiKeys;
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [copyCooldown, setCopyCooldown] = useState(false);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(
    () => new Set(DEFAULT_SCOPES),
  );
  const modalRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Scroll container ref for fade gradient
  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    function checkScrollable() {
      if (el) {
        el.classList.toggle("is-scrollable", el.scrollWidth > el.clientWidth);
      }
    }
    checkScrollable();
    const observer = new ResizeObserver(checkScrollable);
    observer.observe(el);
    return () => observer.disconnect();
  }, [keys]);

  // ESC key to close revoke modal
  useEffect(() => {
    if (!pendingRevokeId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPendingRevokeId(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pendingRevokeId]);

  // Focus trap for revoke modal
  useEffect(() => {
    if (!pendingRevokeId || !modalRef.current) return;
    const el = modalRef.current;
    el.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = el.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [pendingRevokeId]);

  function handleToggleScope(scope: string) {
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) {
        next.delete(scope);
      } else {
        next.add(scope);
      }
      return next;
    });
  }

  const canGenerate = newKeyName.trim().length > 0 && selectedScopes.size > 0;

  function handleCreate() {
    if (!canGenerate) return;
    const fakeKey = `da_demo_${randomDemoToken()}`;
    const newKey: ApiKey = {
      id: createDemoId(),
      name: newKeyName.trim(),
      prefix: `${fakeKey.slice(0, 14)}...${fakeKey.slice(-4)}`,
      created: new Date().toISOString().slice(0, 10),
      lastUsed: null,
      scopes: Array.from(selectedScopes),
      status: "active",
    };
    setKeys((prev) => [newKey, ...prev]);
    setCreatedKey(fakeKey);
    setNewKeyName("");
    setShowCreate(false);
    toast({ type: "success", title: copy.createdTitle });
  }

  function handleCopy() {
    if (!createdKey || copyCooldown) return;
    navigator.clipboard.writeText(createdKey).then(() => {
      setCopied(true);
      setCopyCooldown(true);
      window.setTimeout(() => setCopied(false), 2000);
      window.setTimeout(() => setCopyCooldown(false), 2500);
    }).catch(() => {
      setCopyFailed(true);
      setCopyCooldown(true);
      setTimeout(() => setCopyFailed(false), 2000);
      setTimeout(() => setCopyCooldown(false), 2500);
    });
  }

  function handleRevoke(keyId: string) {
    setKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, status: "revoked" as const } : k)),
    );
    setPendingRevokeId(null);
    toast({ type: "success", title: copy.revokeSuccess });
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === modalRef.current) {
      setPendingRevokeId(null);
    }
  }

  function resetCreateForm() {
    setNewKeyName("");
    setSelectedScopes(new Set(DEFAULT_SCOPES));
  }

  return (
    <WorkspacePageFrame
      title={copy.title}
      titleClassName="text-xl"
    >
    <div className="workspace-page-container" style={{ maxWidth: 1180 }}>
      {/* Info banner + create button row */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--accent-blue)]/20 bg-[var(--accent-blue)]/[0.06] px-5 py-3.5 text-sm shadow-sm dark:border-[var(--accent-blue)]/15 dark:bg-[var(--accent-blue)]/[0.08]">
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
            <Info size={14} strokeWidth={1.5} />
          </span>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-blue)]">{copy.demoKeyPrefix}</span>
            <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{copy.demoNotice}</p>
          </div>
        </div>
        {!showCreate && !createdKey ? (
          <button
            onClick={() => setShowCreate(true)}
            className="workspace-btn-primary self-center px-5 py-2.5 text-sm font-semibold shadow-[0_12px_32px_rgba(47,109,246,0.16)] hover:opacity-95"
          >
            <Plus size={14} strokeWidth={1.5} />
            {copy.create}
          </button>
        ) : null}
      </div>

      {/* Create / created key panels */}
      <div className="mb-6">

        {showCreate && !createdKey ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-foreground">{copy.createTitle}</h3>
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{copy.keyName}</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder={copy.keyNamePlaceholder}
                className="workspace-input text-sm text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="mb-5">
              <label className="mb-2 block text-xs font-medium text-muted-foreground">{copy.permissions}</label>
              <div className="flex flex-wrap gap-2">
                {ALL_SCOPES.map((scope) => (
                  <label key={scope} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs transition-colors hover:border-[var(--accent-blue)]/30">
                    <input type="checkbox" checked={selectedScopes.has(scope)} onChange={() => handleToggleScope(scope)} className="rounded border-border" />
                    <code className="font-mono text-[11px]">{scope}</code>
                  </label>
                ))}
              </div>
              {selectedScopes.has("admin") ? (
                <p className="mt-2 text-[11px] text-[var(--accent-coral)]">{copy.adminScopeWarning}</p>
              ) : null}
              {selectedScopes.size === 0 ? (
                <p className="mt-2 text-[11px] text-[var(--accent-coral)]">{copy.noScopeError}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreate}
                disabled={!canGenerate}
                className="workspace-btn-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
              >
                {copy.generate}
              </button>
              <button
                onClick={() => {
                  setShowCreate(false);
                  resetCreateForm();
                }}
                className="workspace-btn-secondary px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {copy.cancel}
              </button>
            </div>
          </div>
        ) : null}

        {createdKey ? (
          <div className="rounded-2xl border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/5 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-green)]/10">
                <Check size={16} strokeWidth={1.5} className="text-[var(--accent-green)]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 text-sm font-semibold text-foreground">{copy.createdTitle}</h3>
                <p className="mb-3 text-xs text-muted-foreground">{copy.createdBody}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
                    {createdKey}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="workspace-btn-secondary shrink-0 px-3 py-2 text-xs font-medium hover:border-[var(--accent-blue)]"
                  >
                    {copyFailed ? copy.copyFailed : copied ? copy.copied : copy.copy}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setCreatedKey(null);
                  setShowCreate(false);
                  resetCreateForm();
                }}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {copy.done}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Keys table or empty state */}
      {keys.length === 0 && !showCreate && !createdKey ? (
        <EmptyState
          icon={Key}
          title={locale === "zh-CN" ? "暂无 API 密钥" : "No API keys"}
          description={locale === "zh-CN" ? "创建 API 密钥以通过 API 访问审计功能。" : "Create an API key to access audit features via API."}
          action={{ label: locale === "zh-CN" ? "创建密钥" : "Create key", onClick: () => setShowCreate(true) }}
        />
      ) : (
      <>
      <h3 className="mb-3 text-sm font-semibold text-foreground">{copy.activeKeys}</h3>
      <div
        ref={tableScrollRef}
        className="workspace-table-scroll"
        role="region"
        aria-label={copy.activeKeys}
      >
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm dark:border-border/50 dark:shadow-[0_16px_48px_rgba(0,0,0,0.25)]">
        {/* Table header */}
        <div className="hidden border-b border-border/70 bg-muted/40 px-6 py-3 dark:bg-muted/20 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_100px_120px] md:gap-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{copy.keyName}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{copy.prefix}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{copy.permissions}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{copy.status}</span>
          <span className="text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{copy.actions}</span>
        </div>
        {/* Table rows */}
        <div className="divide-y divide-border/60 dark:divide-border/30">
          {keys.map((key) => (
            <div
              key={key.id}
              className={`group grid gap-4 px-6 py-4 transition-colors hover:bg-muted/20 dark:hover:bg-muted/20 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_100px_120px] md:items-center md:gap-4 ${key.status === "revoked" ? "opacity-50" : ""}`}
            >
              {/* Key name + metadata */}
              <div className="min-w-0">
                <span className="truncate text-sm font-medium text-foreground">{key.name}</span>
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 text-[11px] text-muted-foreground">
                  <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[10px] dark:bg-muted/25">{copy.demoKeyPrefix}</span>
                  <span>{copy.createdAt} {formatDateOnly(key.created, locale)}</span>
                  {key.lastUsed ? <span>{copy.lastUsed} {formatDateOnly(key.lastUsed, locale)}</span> : null}
                </div>
              </div>

              {/* Prefix */}
              <div className="flex items-center gap-1.5 min-w-0">
                <code className="inline-block truncate rounded-md border border-border/60 bg-muted/20 px-2 py-1 font-mono text-[11px] text-foreground/80 dark:bg-muted/15">{key.prefix}</code>
                <CopyButton text={key.prefix} label="key prefix" />
              </div>

              {/* Permissions / scopes */}
              <div className="flex flex-wrap gap-1.5">
                {key.scopes.map((scope) => (
                  <span
                    key={scope}
                    className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-2 py-0.5 font-mono text-[10px] text-muted-foreground dark:bg-background/50"
                  >
                    {scope}
                  </span>
                ))}
              </div>

              {/* Status */}
              <div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  key.status === "active"
                    ? "bg-[var(--accent-green)]/10 text-[var(--accent-green)]"
                    : "bg-muted/40 text-muted-foreground dark:bg-muted/25"
                }`}>
                  {key.status === "active" ? copy.active : copy.revoked}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                {key.status === "active" ? (
                  <button
                    onClick={() => setPendingRevokeId(key.id)}
                    className="rounded-lg border border-border/60 bg-background/60 px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:border-[var(--accent-coral)]/30 hover:text-[var(--accent-coral)] dark:bg-background/40"
                  >
                    {copy.revoke}
                  </button>
                ) : (
                  <span className="text-[11px] text-muted-foreground/50">{copy.revokedLabel}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      </>
      )}

      {/* Revoke confirmation modal */}
      {pendingRevokeId ? (
        <div
          ref={modalRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="revoke-dialog-title"
          tabIndex={-1}
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h3 id="revoke-dialog-title" className="text-sm font-semibold text-foreground">{copy.revokeConfirmTitle}</h3>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">{copy.revokeConfirmBody}</p>
            <p className="mt-1 text-[11px] leading-5 text-[var(--accent-coral)]">{copy.revokeConfirmIrreversible}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingRevokeId(null)}
                className="workspace-btn-secondary px-3 py-2 text-xs"
              >
                {copy.revokeConfirmCancel}
              </button>
              <button
                type="button"
                onClick={() => handleRevoke(pendingRevokeId)}
                className="rounded-lg bg-[var(--accent-coral)] px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                {copy.revokeConfirmAction}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Code example */}
      <div className="api-code-block mt-6 overflow-hidden rounded-2xl shadow-sm dark:shadow-[0_16px_48px_rgba(0,0,0,0.1)]">
        <div className="api-code-block-header flex items-center gap-2 px-4 py-2.5">
          <span className="inline-flex items-center rounded-md bg-[var(--accent-blue)]/10 dark:bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent-blue)] dark:text-muted-foreground">bash</span>
          <span className="text-[11px] text-muted-foreground dark:text-muted-foreground">{copy.usageExample}</span>
        </div>
        <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed border-0 rounded-none m-0">
          <code>{`# ${copy.codeComment}
curl -X POST https://your-platform.example/api/v1/audit/jobs \\
  -H "Authorization: Bearer da_demo_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "attack_type": "black-box",
    "target_model": "purchase-predictor-v3",
    "rounds": 10,
    "batch_size": 32
  }'`}</code>
        </pre>
      </div>
    </div>
    </WorkspacePageFrame>
  );
}
