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
    prefix: "da_live_7kX3...mQ9p",
    created: "2026-03-28",
    lastUsed: "2026-04-15",
    scopes: ["audit:read", "audit:write", "results:read"],
    status: "active",
  },
  {
    id: "key_2",
    name: "CI/CD Pipeline",
    prefix: "da_live_9bR1...hT4w",
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

export function ApiKeysClient({ locale }: { locale: Locale }) {
  const copy = WORKSPACE_COPY[locale].apiKeys;
  const [keys] = useState<ApiKey[]>(MOCK_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCreate() {
    if (!newKeyName.trim()) return;
    const fakeKey = `da_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
    setCreatedKey(fakeKey);
    setNewKeyName("");
  }

  function handleCopy() {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <WorkspacePageFrame
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      titleClassName="text-xl"
      descriptionClassName="text-sm"
    >
    <div className="workspace-page-container" style={{ maxWidth: 860 }}>
      <div className="mb-8">
        {!showCreate && !createdKey ? (
          <button
            onClick={() => setShowCreate(true)}
            className="workspace-btn-secondary px-4 py-2.5 text-sm font-medium hover:border-[var(--accent-blue)] hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            {copy.create}
          </button>
        ) : null}

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
                    <input type="checkbox" defaultChecked={scope !== "admin"} className="rounded border-border" />
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
                onClick={() => setShowCreate(false)}
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
                    {copied ? copy.copied : copy.copy}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setCreatedKey(null);
                  setShowCreate(false);
                }}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {copy.done}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/10 px-5 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {copy.activeKeys} · {keys.filter((k) => k.status === "active").length}
          </h3>
        </div>
        <div className="divide-y divide-border">
          {keys.map((key) => (
            <div
              key={key.id}
              className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/5 ${key.status === "revoked" ? "opacity-50" : ""}`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                key.status === "active"
                  ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
                  : "bg-muted/30 text-muted-foreground"
              }`}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{key.name}</span>
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    key.status === "active"
                      ? "bg-[var(--accent-green)]/10 text-[var(--accent-green)]"
                      : "bg-muted/30 text-muted-foreground"
                  }`}>
                    {key.status === "active" ? copy.active : copy.revoked}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <code className="font-mono">{key.prefix}</code>
                  <span>·</span>
                  <span>{copy.createdAt} {key.created}</span>
                  {key.lastUsed ? (
                    <>
                      <span>·</span>
                      <span>{copy.lastUsed} {key.lastUsed}</span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="hidden shrink-0 items-center gap-1 md:flex">
                {key.scopes.map((scope) => (
                  <span
                    key={scope}
                    className="inline-flex items-center rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                  >
                    {scope}
                  </span>
                ))}
              </div>

              {key.status === "active" ? (
                <button className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-all hover:border-[var(--accent-coral)]/30 hover:text-[var(--accent-coral)]">
                  {copy.revoke}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-[#1a1b1e] shadow-sm">
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#222326] px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-[#9ca0aa]">bash</span>
            <span className="text-xs text-[#9ca0aa]">{copy.usageExample}</span>
          </div>
        </div>
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code className="text-[#e0e4ec]">{`# Submit an audit job via API
curl -X POST https://api.diffaudit.com/v1/jobs \\
  -H "Authorization: Bearer da_live_your_key_here" \\
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
