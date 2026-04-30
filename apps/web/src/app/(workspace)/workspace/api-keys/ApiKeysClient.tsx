"use client";

import { useState } from "react";

import { type Locale } from "@/components/language-picker";
import { WorkspacePageFrame } from "@/components/workspace-frame";
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
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(
    () => new Set(["audit:read", "audit:write", "results:read", "results:export"]),
  );

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

  function handleCreate() {
    if (!newKeyName.trim()) return;
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
  }

  function handleCopy() {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    });
  }

  function handleRevoke(keyId: string) {
    setKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, status: "revoked" as const } : k)),
    );
    setPendingRevokeId(null);
  }

  return (
    <WorkspacePageFrame
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      titleClassName="text-xl"
      descriptionClassName="text-sm"
    >
    <div className="workspace-page-container" style={{ maxWidth: 1180 }}>
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="rounded-3xl border border-amber-300/40 bg-[linear-gradient(135deg,rgba(245,158,11,0.16),rgba(47,109,246,0.06))] px-5 py-4 text-sm text-foreground shadow-sm dark:border-amber-500/25 dark:bg-[linear-gradient(135deg,rgba(245,158,11,0.14),rgba(47,109,246,0.08))]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.7 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
              </svg>
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300/90">{copy.demoKeyPrefix}</div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy.demoNotice}</p>
            </div>
          </div>
        </div>
        {!showCreate && !createdKey ? (
          <button
            onClick={() => setShowCreate(true)}
            className="workspace-btn-primary justify-center px-5 py-3 text-sm font-semibold shadow-[0_18px_40px_rgba(47,109,246,0.18)] hover:opacity-95"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            {copy.create}
          </button>
        ) : null}
      </div>

      <div className="mb-8">

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
                {["audit:read", "audit:write", "results:read", "results:export", "admin"].map((scope) => (
                  <label key={scope} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs hover:border-[var(--accent-blue)]/30 transition-colors">
                    <input type="checkbox" checked={selectedScopes.has(scope)} onChange={() => handleToggleScope(scope)} className="rounded border-border" />
                    <code className="font-mono text-[11px]">{scope}</code>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreate}
                disabled={!newKeyName.trim()}
                className="workspace-btn-primary px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
              >
                {copy.generate}
              </button>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setSelectedScopes(new Set(["audit:read", "audit:write", "results:read", "results:export"]));
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
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--accent-green)]" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 text-sm font-semibold text-foreground">{copy.createdTitle}</h3>
                <p className="mb-3 text-xs text-muted-foreground">{copy.createdBody}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground">
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
                  setSelectedScopes(new Set(["audit:read", "audit:write", "results:read", "results:export"]));
                }}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {copy.done}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,var(--card),rgba(47,109,246,0.025))] shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
        <div className="border-b border-border/70 bg-muted/10 px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {copy.activeKeys} · {keys.filter((k) => k.status === "active").length}
          </h3>
        </div>
        <div className="divide-y divide-border/70">
          {keys.map((key) => (
            <div
              key={key.id}
              className={`flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-muted/5 xl:flex-row xl:items-center ${key.status === "revoked" ? "opacity-50" : ""}`}
            >
              <div className="flex min-w-0 flex-1 gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  key.status === "active"
                    ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
                    : "bg-muted/30 text-muted-foreground"
                }`}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
                    <span className="min-w-0 truncate text-sm font-medium text-foreground">{key.name}</span>
                    <span className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      key.status === "active"
                        ? "bg-[var(--accent-green)]/10 text-[var(--accent-green)]"
                        : "bg-muted/30 text-muted-foreground"
                    }`}>
                      {key.status === "active" ? copy.active : copy.revoked}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <code className="rounded-lg border border-border/70 bg-background/60 px-2 py-1 font-mono text-foreground/85">{key.prefix}</code>
                    <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[10px]">{copy.demoKeyPrefix}</span>
                    <span>{copy.createdAt} {key.created}</span>
                    {key.lastUsed ? <span>{copy.lastUsed} {key.lastUsed}</span> : null}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 xl:max-w-[360px] xl:justify-end xl:shrink-0">
                {key.scopes.map((scope) => (
                  <span
                    key={scope}
                    className="inline-flex items-center rounded-full border border-border bg-background/80 px-2 py-1 text-[10px] font-mono text-muted-foreground"
                  >
                    {scope}
                  </span>
                ))}
              </div>

              {key.status === "active" ? (
                <button
                  onClick={() => setPendingRevokeId(key.id)}
                  className="min-h-11 shrink-0 self-end rounded-full border border-border bg-background/70 px-4 py-2 text-[11px] font-medium text-muted-foreground transition-all hover:border-[var(--accent-coral)]/30 hover:text-[var(--accent-coral)] xl:self-center"
                >
                  {copy.revoke}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {pendingRevokeId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-foreground">{copy.revokeConfirmTitle}</h3>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">{copy.revokeConfirmBody}</p>
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

      <div className="mt-8 overflow-hidden rounded-[28px] border border-border bg-[#111318] shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#222326] px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-[#9ca0aa]">bash</span>
            <span className="text-xs text-[#9ca0aa]">{copy.usageExample}</span>
          </div>
        </div>
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code className="text-[#e0e4ec]">{`# Demo preview only: submit shape via the Platform gateway
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
