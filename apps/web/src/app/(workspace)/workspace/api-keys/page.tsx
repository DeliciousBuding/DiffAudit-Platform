"use client";

import { useState } from "react";

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

export default function ApiKeysPage() {
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
    if (createdKey) {
      navigator.clipboard.writeText(createdKey).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="workspace-page-container" style={{ maxWidth: 860 }}>
      {/* Header */}
      <div className="mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          API Keys
        </p>
      </div>
      <h1 className="text-xl font-semibold text-foreground mb-1">
        Manage API access credentials.
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Create and manage API keys to access the DiffAudit platform programmatically. Keys are scoped to specific permissions and can be revoked at any time.
      </p>

      {/* Create key section */}
      <div className="mb-8">
        {!showCreate && !createdKey && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-[var(--accent-blue)] hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create new key
          </button>
        )}

        {showCreate && !createdKey && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Create a new API key</h3>
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Key name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production Runner, CI Pipeline"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition-all"
              />
            </div>
            <div className="mb-5">
              <label className="block text-xs font-medium text-muted-foreground mb-2">Permissions</label>
              <div className="flex flex-wrap gap-2">
                {["audit:read", "audit:write", "results:read", "results:export", "admin"].map((scope) => (
                  <label key={scope} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs cursor-pointer hover:border-[var(--accent-blue)]/30 transition-colors">
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
              >
                Generate key
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {createdKey && (
          <div className="rounded-2xl border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/5 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-green)]/10">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--accent-green)]" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-1">Key created successfully</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Copy your key now — you won&apos;t be able to see it again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-background border border-border px-3 py-2 text-xs font-mono text-foreground truncate">
                    {createdKey}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:border-[var(--accent-blue)] transition-all"
                  >
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => { setCreatedKey(null); setShowCreate(false); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Key list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border bg-muted/10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active keys · {keys.filter(k => k.status === "active").length}
          </h3>
        </div>
        <div className="divide-y divide-border">
          {keys.map((key) => (
            <div
              key={key.id}
              className={`px-5 py-4 flex items-center gap-4 transition-colors hover:bg-muted/5 ${key.status === "revoked" ? "opacity-50" : ""}`}
            >
              {/* Icon */}
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                key.status === "active"
                  ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
                  : "bg-muted/30 text-muted-foreground"
              }`}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-foreground truncate">{key.name}</span>
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    key.status === "active"
                      ? "bg-[var(--accent-green)]/10 text-[var(--accent-green)]"
                      : "bg-muted/30 text-muted-foreground"
                  }`}>
                    {key.status === "active" ? "Active" : "Revoked"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <code className="font-mono">{key.prefix}</code>
                  <span>·</span>
                  <span>Created {key.created}</span>
                  {key.lastUsed && (
                    <>
                      <span>·</span>
                      <span>Last used {key.lastUsed}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Scopes */}
              <div className="hidden md:flex items-center gap-1 shrink-0">
                {key.scopes.map((scope) => (
                  <span
                    key={scope}
                    className="inline-flex items-center rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                  >
                    {scope}
                  </span>
                ))}
              </div>

              {/* Actions */}
              {key.status === "active" && (
                <button className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-[var(--accent-coral)] hover:border-[var(--accent-coral)]/30 transition-all">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Usage example */}
      <div className="mt-8 rounded-2xl border border-border bg-[#1a1b1e] overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2 bg-[#222326]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-[#9ca0aa]">bash</span>
            <span className="text-xs text-[#9ca0aa]">API usage example</span>
          </div>
        </div>
        <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
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
  );
}
