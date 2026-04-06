const DEFAULT_API_BASE_URL = "http://127.0.0.1:8780";

const TRACK_ORDER = ["black-box", "gray-box", "white-box"] as const;
const AVAILABILITY_ORDER: Record<CatalogAvailability, number> = {
  ready: 0,
  partial: 1,
  planned: 2,
};

export type CatalogAvailability = "ready" | "partial" | "planned";
export type CatalogTrack = (typeof TRACK_ORDER)[number];

export type CatalogEntryPayload = {
  key: string;
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
  key: string;
  label: string;
  track: string;
  availability: CatalogAvailability;
  evidenceLevel: string;
  capabilityLabel: string;
  paper: string;
  runtimeLabel: string;
  bestWorkspace: string;
  bestSummaryPath: string;
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

function backendBaseUrl() {
  return process.env.DIFFAUDIT_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function formatRuntimeLabel(entry: CatalogEntryPayload) {
  if (!entry.backend) {
    return "unassigned backend";
  }

  return entry.scheduler ? `${entry.backend} / ${entry.scheduler}` : entry.backend;
}

function toEntryViewModel(entry: CatalogEntryPayload): CatalogEntryViewModel {
  return {
    key: entry.key,
    label: entry.label,
    track: entry.track,
    availability: entry.availability,
    evidenceLevel: entry.evidence_level ?? "catalog",
    capabilityLabel: `${entry.attack_family} / ${entry.target_key}`,
    paper: entry.paper ?? "unknown",
    runtimeLabel: formatRuntimeLabel(entry),
    bestWorkspace: entry.best_workspace ?? "pending workspace",
    bestSummaryPath: entry.best_summary_path ?? "pending summary",
  };
}

export function summarizeCatalogEntries(
  entries: CatalogEntryPayload[],
): CatalogDashboardViewModel {
  const stats = {
    total: entries.length,
    ready: entries.filter((entry) => entry.availability === "ready").length,
    partial: entries.filter((entry) => entry.availability === "partial").length,
    planned: entries.filter((entry) => entry.availability === "planned").length,
  };

  const mappedEntries = entries
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

      return left.key.localeCompare(right.key);
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
    const response = await fetch(url, {
      cache: "no-store",
    });
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
