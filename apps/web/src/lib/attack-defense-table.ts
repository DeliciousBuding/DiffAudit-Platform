import { fetchWithTimeout } from "@/lib/fetch-timeout";
import { classifyRisk, type RiskLevel } from "@/lib/risk-report";
import { DEMO_ATTACK_DEFENSE_ROWS } from "@/lib/demo-snapshot";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8780";
const DEFAULT_SERVER_FETCH_TIMEOUT_MS = 600;

export type AttackDefenseRowPayload = {
  track?: string | null;
  attack?: string | null;
  defense?: string | null;
  model?: string | null;
  auc?: number | null;
  asr?: number | null;
  tpr_at_1pct_fpr?: number | null;
  quality_cost?: string | null;
  evidence_level?: string | null;
  note?: string | null;
};

export type AttackDefenseRowViewModel = {
  track: string;
  attack: string;
  defense: string;
  model: string;
  aucLabel: string;
  asrLabel: string;
  tprLabel: string;
  qualityCost: string;
  evidenceLevel: string;
  note: string;
  riskLevel: RiskLevel;
};

export type AttackDefenseTableViewModel = {
  stats: {
    total: number;
    defended: number;
    undefended: number;
  };
  rows: AttackDefenseRowViewModel[];
};

function backendBaseUrl() {
  return process.env.DIFFAUDIT_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function formatMetric(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "n/a";
  }
  return value.toFixed(3);
}

function normalizeRow(row: unknown): AttackDefenseRowPayload | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const candidate = row as Record<string, unknown>;
  if (
    typeof candidate.track !== "string" ||
    typeof candidate.attack !== "string" ||
    typeof candidate.defense !== "string"
  ) {
    return null;
  }

  return {
    track: candidate.track,
    attack: candidate.attack,
    defense: candidate.defense,
    model: typeof candidate.model === "string" ? candidate.model : null,
    auc: typeof candidate.auc === "number" ? candidate.auc : null,
    asr: typeof candidate.asr === "number" ? candidate.asr : null,
    tpr_at_1pct_fpr:
      typeof candidate.tpr_at_1pct_fpr === "number" ? candidate.tpr_at_1pct_fpr : null,
    quality_cost: typeof candidate.quality_cost === "string" ? candidate.quality_cost : null,
    evidence_level:
      typeof candidate.evidence_level === "string" ? candidate.evidence_level : null,
    note: typeof candidate.note === "string" ? candidate.note : null,
  };
}

export function summarizeAttackDefenseTable(rows: AttackDefenseRowPayload[]) {
  const normalizedRows = rows
    .map((row) => normalizeRow(row))
    .filter((row): row is AttackDefenseRowPayload => row !== null);

  return {
    stats: {
      total: normalizedRows.length,
      defended: normalizedRows.filter((row) => row.defense !== "none").length,
      undefended: normalizedRows.filter((row) => row.defense === "none").length,
    },
    rows: normalizedRows.map((row) => ({
      track: row.track ?? "unknown",
      attack: row.attack ?? "unknown attack",
      defense: row.defense ?? "unknown defense",
      model: row.model ?? "unknown model",
      aucLabel: formatMetric(row.auc),
      asrLabel: formatMetric(row.asr),
      tprLabel: formatMetric(row.tpr_at_1pct_fpr),
      qualityCost: row.quality_cost ?? "No cost information provided.",
      evidenceLevel: row.evidence_level ?? "unknown",
      note: row.note ?? "No additional notes.",
      riskLevel: classifyRisk(row.auc ?? 0),
    })),
  } satisfies AttackDefenseTableViewModel;
}

/** Check if Demo Mode is enabled via cookie */
async function isDemoModeEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get("platform-demo-mode")?.value === "1";
  } catch {
    return false;
  }
}

export async function fetchAttackDefenseTable(): Promise<AttackDefenseTableViewModel | null> {
  // Demo Mode: return snapshot data without calling Runtime
  if (await isDemoModeEnabled()) {
    return summarizeAttackDefenseTable(DEMO_ATTACK_DEFENSE_ROWS);
  }

  const url = new URL("/api/v1/evidence/attack-defense-table", backendBaseUrl());

  try {
    const response = await fetchWithTimeout(
      url,
      { cache: "no-store" },
      { timeoutMs: DEFAULT_SERVER_FETCH_TIMEOUT_MS },
    );
    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    if (!payload || typeof payload !== "object" || !Array.isArray(payload.rows)) {
      return null;
    }

    return summarizeAttackDefenseTable(payload.rows as AttackDefenseRowPayload[]);
  } catch {
    return null;
  }
}
