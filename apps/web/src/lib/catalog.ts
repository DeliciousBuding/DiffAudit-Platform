import { fetchWithTimeout } from "@/lib/fetch-timeout";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8780";
const DEFAULT_SERVER_FETCH_TIMEOUT_MS = 600;

const TRACK_ORDER = ["black-box", "gray-box", "white-box"] as const;
const AVAILABILITY_ORDER: Record<CatalogAvailability, number> = {
  ready: 0,
  partial: 1,
  planned: 2,
};

export type CatalogAvailability = "ready" | "partial" | "planned";
export type CatalogTrack = (typeof TRACK_ORDER)[number];

export type CatalogEntryPayload = {
  contract_key?: string | null;
  key?: string | null;
  track: string;
  attack_family: string;
  target_key: string;
  label: string;
  paper?: string | null;
  backend?: string | null;
  scheduler?: string | null;
  availability: CatalogAvailability;
  evidence_level?: string | null;
  best_summary_path?: string | null;
  best_workspace?: string | null;
  system_gap?: string | null;
};

export type CatalogTrackSummary = {
  track: CatalogTrack;
  total: number;
  ready: number;
  partial: number;
  planned: number;
  entries: CatalogEntryViewModel[];
};

export type CatalogEntryViewModel = {
  contractKey: string;
  label: string;
  track: string;
  availability: CatalogAvailability;
  evidenceLevel: string;
  capabilityLabel: string;
  paper: string;
  runtimeLabel: string;
  bestWorkspace: string;
  bestSummaryPath: string;
  systemGap: string;
};

export type CatalogDashboardViewModel = {
  stats: {
    total: number;
    ready: number;
    partial: number;
    planned: number;
  };
  tracks: CatalogTrackSummary[];
};

function isCatalogTrack(value: unknown): value is CatalogTrack {
  return TRACK_ORDER.includes(value as CatalogTrack);
}

function isCatalogAvailability(value: unknown): value is CatalogAvailability {
  return value === "ready" || value === "partial" || value === "planned";
}

function backendBaseUrl() {
  return process.env.DIFFAUDIT_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function formatRuntimeLabel(entry: CatalogEntryPayload) {
  if (!entry.backend) {
    return "unassigned runtime";
  }

  return entry.scheduler ? `${entry.backend} / ${entry.scheduler}` : entry.backend;
}

function toEntryViewModel(entry: CatalogEntryPayload): CatalogEntryViewModel {
  return {
    contractKey: entry.contract_key ?? entry.key ?? "",
    label: entry.label,
    track: entry.track,
    availability: entry.availability,
    evidenceLevel: entry.evidence_level ?? "catalog",
    capabilityLabel: `${entry.attack_family} / ${entry.target_key}`,
    paper: entry.paper ?? "unknown",
    runtimeLabel: formatRuntimeLabel(entry),
    bestWorkspace: entry.best_workspace ?? "pending workspace",
    bestSummaryPath: entry.best_summary_path ?? "pending summary",
    systemGap: entry.system_gap ?? "pending system gap explanation",
  };
}

function normalizeCatalogEntry(entry: unknown): CatalogEntryPayload | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const candidate = entry as Record<string, unknown>;
  const contractKey =
    typeof candidate.contract_key === "string"
      ? candidate.contract_key
      : typeof candidate.key === "string"
        ? candidate.key
        : null;
  if (
    typeof contractKey !== "string" ||
    !isCatalogTrack(candidate.track) ||
    typeof candidate.attack_family !== "string" ||
    typeof candidate.target_key !== "string" ||
    typeof candidate.label !== "string" ||
    !isCatalogAvailability(candidate.availability)
  ) {
    return null;
  }

  return {
    contract_key: contractKey,
    track: candidate.track,
    attack_family: candidate.attack_family,
    target_key: candidate.target_key,
    label: candidate.label,
    paper: typeof candidate.paper === "string" ? candidate.paper : null,
    backend: typeof candidate.backend === "string" ? candidate.backend : null,
    scheduler: typeof candidate.scheduler === "string" ? candidate.scheduler : null,
    availability: candidate.availability,
    evidence_level:
      typeof candidate.evidence_level === "string" ? candidate.evidence_level : null,
    best_summary_path:
      typeof candidate.best_summary_path === "string" ? candidate.best_summary_path : null,
    best_workspace:
      typeof candidate.best_workspace === "string" ? candidate.best_workspace : null,
    system_gap: typeof candidate.system_gap === "string" ? candidate.system_gap : null,
  };
}

export function summarizeCatalogEntries(
  entries: CatalogEntryPayload[],
): CatalogDashboardViewModel {
  const normalizedEntries = entries
    .map((entry) => normalizeCatalogEntry(entry))
    .filter((entry): entry is CatalogEntryPayload => entry !== null);

  const stats = {
    total: normalizedEntries.length,
    ready: normalizedEntries.filter((entry) => entry.availability === "ready").length,
    partial: normalizedEntries.filter((entry) => entry.availability === "partial").length,
    planned: normalizedEntries.filter((entry) => entry.availability === "planned").length,
  };

  const mappedEntries = normalizedEntries
    .map(toEntryViewModel)
    .sort((left, right) => {
      const trackDiff =
        TRACK_ORDER.indexOf(left.track as CatalogTrack) -
        TRACK_ORDER.indexOf(right.track as CatalogTrack);
      if (trackDiff !== 0) {
        return trackDiff;
      }

      const availabilityDiff =
        AVAILABILITY_ORDER[left.availability] - AVAILABILITY_ORDER[right.availability];
      if (availabilityDiff !== 0) {
        return availabilityDiff;
      }

      return left.contractKey.localeCompare(right.contractKey);
    });

  const tracks = TRACK_ORDER.map((track) => {
    const trackEntries = mappedEntries.filter((entry) => entry.track === track);
    return {
      track,
      total: trackEntries.length,
      ready: trackEntries.filter((entry) => entry.availability === "ready").length,
      partial: trackEntries.filter((entry) => entry.availability === "partial").length,
      planned: trackEntries.filter((entry) => entry.availability === "planned").length,
      entries: trackEntries,
    };
  });

  return {
    stats,
    tracks,
  };
}

export async function fetchCatalogDashboard(): Promise<CatalogDashboardViewModel | null> {
  const url = new URL("/api/v1/catalog", backendBaseUrl());

  try {
    const response = await fetchWithTimeout(
      url,
      {
        cache: "no-store",
      },
      { timeoutMs: DEFAULT_SERVER_FETCH_TIMEOUT_MS },
    );
    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
      return null;
    }

    return summarizeCatalogEntries(payload as CatalogEntryPayload[]);
  } catch {
    return null;
  }
}
