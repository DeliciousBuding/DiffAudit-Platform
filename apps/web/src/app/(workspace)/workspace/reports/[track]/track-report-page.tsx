import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { type Locale } from "@/components/language-picker";
import {
  fetchAttackDefenseTable,
  type AttackDefenseRowViewModel,
} from "@/lib/attack-defense-table";
import {
  fetchCatalogDashboard,
  type CatalogEntryViewModel,
  type CatalogTrack,
} from "@/lib/catalog";
import { type EvidenceSummaryPayload } from "@/lib/audit-client";
import { fetchWithTimeout } from "@/lib/fetch-timeout";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { ReportAuditView, type ReportProvenance } from "./ReportAuditView";
import { ReportDisplayView } from "./ReportDisplayView";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8780";
const DEFAULT_SERVER_FETCH_TIMEOUT_MS = 600;
const TRACKS: CatalogTrack[] = ["black-box", "gray-box", "white-box"];

type ViewMode = "display" | "audit";

export type TrackReportPageSearchParams = {
  view?: string | string[];
};

export type RenderTrackReportPageOptions = {
  locale?: Locale;
  params: { track: string };
  searchParams?: TrackReportPageSearchParams;
};

function backendBaseUrl() {
  return process.env.DIFFAUDIT_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function isTrack(value: string): value is CatalogTrack {
  return TRACKS.includes(value as CatalogTrack);
}

function parseViewMode(view?: string | string[]): ViewMode {
  const resolved = Array.isArray(view) ? view[0] : view;
  return resolved === "audit" ? "audit" : "display";
}

function trackLabel(locale: Locale, track: CatalogTrack) {
  if (locale === "zh-CN") {
    if (track === "black-box") {
      return "黑盒";
    }
    if (track === "gray-box") {
      return "灰盒";
    }
    return "白盒";
  }

  if (track === "black-box") {
    return "Black-box";
  }
  if (track === "gray-box") {
    return "Gray-box";
  }
  return "White-box";
}

function pageTitle(locale: Locale, label: string) {
  return locale === "zh-CN" ? `${label}报告详情` : `${label} report details`;
}

function pageDescription(locale: Locale, label: string) {
  return locale === "zh-CN"
    ? "同一攻击线的展示视图与长期审计视图共用这一个入口，默认保持展示形态。"
    : `This route keeps both the display view and the long-term audit view for the ${label.toLowerCase()} track.`;
}

function toggleLabel(locale: Locale, view: ViewMode) {
  if (locale === "zh-CN") {
    return view === "display" ? "展示视图" : "审计视图";
  }
  return view === "display" ? "Display view" : "Audit view";
}

function historyPlaceholder(locale: Locale, label: string) {
  return locale === "zh-CN"
    ? `${label} track 的 prior verdict 还没有进入 append-only 消费链，当前只保留占位。`
    : `Prior verdict stacking for the ${label.toLowerCase()} track is not wired yet; this placeholder reserves the slot.`;
}

function sanitizePath(value?: string | null) {
  if (!value || value.startsWith("pending ")) {
    return undefined;
  }
  return value;
}

function parseScheduler(runtimeLabel?: string) {
  if (!runtimeLabel) {
    return undefined;
  }

  const parts = runtimeLabel.split("/").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return parts[1];
  }
  return undefined;
}

function pickPrimaryEntry(entries: CatalogEntryViewModel[]) {
  return entries[0];
}

async function fetchTrackProvenance(entry?: CatalogEntryViewModel): Promise<ReportProvenance> {
  if (!entry) {
    return {};
  }

  const base: ReportProvenance = {
    runDirectoryPath: sanitizePath(entry.bestWorkspace),
    schedule: parseScheduler(entry.runtimeLabel),
    summaryPath: sanitizePath(entry.bestSummaryPath),
  };

  const workspace = sanitizePath(entry.bestWorkspace);
  if (!workspace) {
    return base;
  }

  try {
    const response = await fetchWithTimeout(
      new URL(`/api/v1/experiments/${encodeURIComponent(workspace)}/summary`, backendBaseUrl()),
      { cache: "no-store" },
      { timeoutMs: DEFAULT_SERVER_FETCH_TIMEOUT_MS },
    );
    if (!response.ok) {
      return base;
    }

    const summary = await response.json() as EvidenceSummaryPayload;
    return {
      runDirectoryPath: typeof summary.workspace === "string" ? summary.workspace : base.runDirectoryPath,
      seed: undefined,
      schedule: typeof summary.scheduler === "string" ? summary.scheduler : base.schedule,
      fixtureVersion: undefined,
      summaryPath: typeof summary.summary_path === "string" ? summary.summary_path : base.summaryPath,
    };
  } catch {
    return base;
  }
}

function filterRows(rows: AttackDefenseRowViewModel[], track: CatalogTrack) {
  return rows.filter((row) => row.track === track);
}

export async function renderTrackReportPage({
  locale,
  params,
  searchParams,
}: RenderTrackReportPageOptions) {
  const track = params.track;
  if (!isTrack(track)) {
    notFound();
  }

  const resolvedLocale = locale ?? resolveLocaleFromHeaderStore(await headers());
  const currentView = parseViewMode(searchParams?.view);
  const [table, catalog] = await Promise.all([
    fetchAttackDefenseTable(),
    fetchCatalogDashboard(),
  ]);

  const rows = filterRows(table?.rows ?? [], track);
  const catalogEntries = catalog?.tracks.find((item) => item.track === track)?.entries ?? [];
  const provenance = await fetchTrackProvenance(pickPrimaryEntry(catalogEntries));
  const label = trackLabel(resolvedLocale, track);
  const displayHref = `/workspace/reports/${track}?view=display`;
  const auditHref = `/workspace/reports/${track}?view=audit`;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <h1 className="mt-1 text-lg font-semibold">{pageTitle(resolvedLocale, label)}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {pageDescription(resolvedLocale, label)}
          </p>
        </div>

        <div className="inline-flex items-center border border-border bg-card p-1 text-xs">
          <Link
            href={displayHref}
            className={`px-3 py-1.5 ${
              currentView === "display" ? "bg-muted text-foreground" : "text-muted-foreground"
            }`}
          >
            {toggleLabel(resolvedLocale, "display")}
          </Link>
          <Link
            href={auditHref}
            className={`px-3 py-1.5 ${
              currentView === "audit" ? "bg-muted text-foreground" : "text-muted-foreground"
            }`}
          >
            {toggleLabel(resolvedLocale, "audit")}
          </Link>
        </div>
      </div>

      {currentView === "audit" ? (
        <ReportAuditView
          locale={resolvedLocale}
          rows={rows}
          provenance={provenance}
          historyPlaceholder={historyPlaceholder(resolvedLocale, label)}
        />
      ) : (
        <ReportDisplayView locale={resolvedLocale} rows={rows} />
      )}
    </div>
  );
}
