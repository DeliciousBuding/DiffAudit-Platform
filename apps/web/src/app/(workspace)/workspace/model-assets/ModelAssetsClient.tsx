"use client";

import { Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Upload, Check, Database } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";

import { Modal } from "@/components/modal";
import { StatusBadge } from "@/components/status-badge";
import type { CatalogDashboardViewModel, CatalogEntryViewModel, AttackDefenseTableViewModel } from "@/lib/workspace-source";

const TRACK_DOT_COLORS: Record<string, string> = {
  "black-box": "var(--track-black)",
  "gray-box": "var(--track-gray)",
  "white-box": "var(--track-white)",
};

const EVIDENCE_ORDER = ["mainline", "catalog", "challenger"] as const;
const PAGE_SIZE = 8;

const TRACK_OPTIONS = ["black-box", "gray-box", "white-box"] as const;

function evidenceRank(level: string): number {
  const idx = EVIDENCE_ORDER.indexOf(level as (typeof EVIDENCE_ORDER)[number]);
  return idx >= 0 ? idx : EVIDENCE_ORDER.length;
}

function availabilityTone(availability: string): "success" | "warning" | "info" | "neutral" {
  if (availability === "ready") return "success";
  if (availability === "partial") return "warning";
  return "info";
}

/**
 * Extract the target key from a contract key.
 * Contract key format: "track/attack_family/target_key"
 * Returns everything after the first two path segments.
 */
function extractTargetKey(contractKey: string): string {
  const parts = contractKey.split("/");
  return parts.length >= 3 ? parts.slice(2).join("/") : contractKey;
}

type Copy = {
  bestEvidence: string;
  emptyNav: string;
  emptyTimeline: string;
  emptyEvidence: string;
  attack: string;
  defense: string;
  auc: string;
  asr: string;
  tpr: string;
  source: string;
  runtime: string;
  evidenceLevel: string;
  workspace: string;
  systemGap: string;
  addModel: string;
  addModelDisabled: string;
  searchModels: string;
  clearSearch: string;
  noSearchResults: string;
  tabTimeline: string;
  tabEvidence: string;
  trackBlackBox: string;
  trackGrayBox: string;
  trackWhiteBox: string;
  availabilityLabels: Record<string, string>;
  evidenceLevelLabels: Record<string, string>;
  addModelTitle: string;
  editModelTitle: string;
  modelName: string;
  modelNamePlaceholder: string;
  modelTrack: string;
  modelTrackPlaceholder: string;
  modelDescription: string;
  modelDescriptionPlaceholder: string;
  cancel: string;
  submit: string;
  edit: string;
  delete: string;
  deleteModelTitle: string;
  deleteModelConfirm: string;
  deleteModelAction: string;
  demoModeNote: string;
  uploadFile: string;
  uploadDragDrop: string;
  uploadComplete: string;
  uploadProgress: string;
};

type ModelAssetsClientProps = {
  catalog: CatalogDashboardViewModel;
  attackDefense: AttackDefenseTableViewModel | null;
  copy: Copy;
};

export function ModelAssetsClient({ catalog, attackDefense, copy }: ModelAssetsClientProps) {
  const TRACK_DISPLAY: Record<string, string> = {
    "black-box": copy.trackBlackBox,
    "gray-box": copy.trackGrayBox,
    "white-box": copy.trackWhiteBox,
  };

  // --- Local mutable catalog state ---
  const [localCatalog, setLocalCatalog] = useState<CatalogDashboardViewModel>(catalog);

  // Keep local catalog in sync when server data changes
  useEffect(() => {
    setLocalCatalog(catalog);
  }, [catalog]);

  const allEntries = useMemo(() => localCatalog.tracks.flatMap((t) => t.entries), [localCatalog]);

  const [selectedEntry, setSelectedEntry] = useState<CatalogEntryViewModel | null>(() => allEntries[0] ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"timeline" | "evidence">("timeline");
  const [evidencePage, setEvidencePage] = useState(1);

  // --- Modal state ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // --- Form state ---
  const [formName, setFormName] = useState("");
  const [formTrack, setFormTrack] = useState<string>("black-box");
  const [formDescription, setFormDescription] = useState("");

  // --- Upload simulation state ---
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const uploadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- CRUD helpers ---
  function addEntryToCatalog(entry: CatalogEntryViewModel) {
    setLocalCatalog((prev) => {
      const trackIndex = prev.tracks.findIndex((t) => t.track === entry.track);
      if (trackIndex === -1) {
        // New track
        return {
          stats: { ...prev.stats, total: prev.stats.total + 1 },
          tracks: [
            ...prev.tracks,
            {
              track: entry.track as CatalogEntryViewModel["track"] & string,
              total: 1,
              ready: entry.availability === "ready" ? 1 : 0,
              partial: entry.availability === "partial" ? 1 : 0,
              planned: entry.availability === "planned" ? 1 : 0,
              entries: [entry],
            },
          ],
        };
      }
      const newTracks = [...prev.tracks];
      const track = { ...newTracks[trackIndex] };
      track.entries = [...track.entries, entry];
      track.total += 1;
      if (entry.availability === "ready") track.ready += 1;
      else if (entry.availability === "partial") track.partial += 1;
      else track.planned += 1;
      newTracks[trackIndex] = track;
      return {
        stats: { ...prev.stats, total: prev.stats.total + 1 },
        tracks: newTracks,
      };
    });
  }

  function updateEntryInCatalog(contractKey: string, updates: Partial<CatalogEntryViewModel>) {
    setLocalCatalog((prev) => ({
      ...prev,
      tracks: prev.tracks.map((track) => ({
        ...track,
        entries: track.entries.map((entry) =>
          entry.contractKey === contractKey ? { ...entry, ...updates } : entry,
        ),
      })),
    }));
  }

  function removeEntryFromCatalog(contractKey: string) {
    setLocalCatalog((prev) => {
      let removedAvailability: string | null = null;
      const newTracks = prev.tracks
        .map((track) => {
          const newEntries = track.entries.filter((entry) => {
            if (entry.contractKey === contractKey) {
              removedAvailability = entry.availability;
              return false;
            }
            return true;
          });
          return { ...track, entries: newEntries, total: newEntries.length };
        })
        .filter((track) => track.entries.length > 0);

      const delta = removedAvailability ? 1 : 0;
      return {
        stats: {
          total: prev.stats.total - delta,
          ready: removedAvailability === "ready" ? prev.stats.ready - 1 : prev.stats.ready,
          partial: removedAvailability === "partial" ? prev.stats.partial - 1 : prev.stats.partial,
          planned: removedAvailability === "planned" ? prev.stats.planned - 1 : prev.stats.planned,
        },
        tracks: newTracks,
      };
    });
  }

  // --- Add Model ---
  function handleOpenAdd() {
    setFormName("");
    setFormTrack("black-box");
    setFormDescription("");
    setUploadProgress(null);
    setUploadComplete(false);
    setShowAddModal(true);
  }

  function handleSimulateUpload() {
    setUploadProgress(0);
    setUploadComplete(false);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        setUploadComplete(true);
      } else {
        setUploadProgress(progress);
      }
    }, 40);
    uploadTimerRef.current = interval;
  }

  // Cleanup upload timer on unmount
  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
    };
  }, []);

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = formName.trim();
    if (!name) return;

    const trackPrefix = formTrack;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const contractKey = `${trackPrefix}/custom/${slug}-${Date.now()}`;

    const newEntry: CatalogEntryViewModel = {
      contractKey,
      label: name,
      track: trackPrefix,
      availability: "planned",
      evidenceLevel: "catalog",
      capabilityLabel: "custom / user-defined",
      paper: "",
      runtimeLabel: "",
      bestWorkspace: "",
      bestSummaryPath: "",
      systemGap: "",
      description: formDescription.trim(),
    };

    addEntryToCatalog(newEntry);
    setSelectedEntry(newEntry);
    setActiveTab("timeline");
    setEvidencePage(1);
    setShowAddModal(false);
  }

  // --- Edit Model ---
  function handleOpenEdit() {
    if (!selectedEntry) return;
    setFormName(selectedEntry.label);
    setFormTrack(selectedEntry.track);
    setFormDescription(selectedEntry.description ?? "");
    setShowEditModal(true);
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEntry) return;
    const name = formName.trim();
    if (!name) return;

    updateEntryInCatalog(selectedEntry.contractKey, {
      label: name,
      description: formDescription.trim(),
    });

    // Update the selectedEntry reference to reflect changes
    setSelectedEntry((prev) =>
      prev && prev.contractKey === selectedEntry.contractKey
        ? { ...prev, label: name, description: formDescription.trim() }
        : prev,
    );
    setShowEditModal(false);
  }

  // --- Delete Model ---
  function handleOpenDelete() {
    setShowDeleteConfirm(true);
  }

  function handleDeleteConfirm() {
    if (!selectedEntry) return;
    const currentKey = selectedEntry.contractKey;

    // Find the next entry to select
    const currentIndex = filteredEntries.findIndex((e) => e.contractKey === currentKey);
    const nextEntry =
      filteredEntries[currentIndex + 1] ?? filteredEntries[currentIndex - 1] ?? null;

    removeEntryFromCatalog(currentKey);
    setSelectedEntry(nextEntry);
    setActiveTab("timeline");
    setEvidencePage(1);
    setShowDeleteConfirm(false);
  }

  // [issue 1] Filter entries by search — also match track display name
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return allEntries;
    const q = searchQuery.toLowerCase();
    return allEntries.filter((e) =>
      e.label.toLowerCase().includes(q) ||
      e.capabilityLabel.toLowerCase().includes(q) ||
      e.track.toLowerCase().includes(q) ||
      (TRACK_DISPLAY[e.track] ?? "").toLowerCase().includes(q)
    );
  }, [allEntries, searchQuery, copy]);

  // [issue 7] Reset selected entry when it is no longer in the filtered list
  useEffect(() => {
    if (selectedEntry && !filteredEntries.some((e) => e.contractKey === selectedEntry.contractKey)) {
      setSelectedEntry(filteredEntries[0] ?? null);
      setActiveTab("timeline");
      setEvidencePage(1);
    }
  }, [filteredEntries, selectedEntry]);

  // Group filtered entries by track
  const entriesByTrack = useMemo(() => {
    const map = new Map<string, CatalogEntryViewModel[]>();
    for (const entry of filteredEntries) {
      const list = map.get(entry.track) ?? [];
      list.push(entry);
      map.set(entry.track, list);
    }
    return map;
  }, [filteredEntries]);

  // [issue 4] Selected model target — use contract key parsing instead of fragile label split
  const selectedTarget = useMemo(() => {
    if (!selectedEntry) return null;
    return extractTargetKey(selectedEntry.contractKey);
  }, [selectedEntry]);

  // Timeline entries for selected model — group by target key derived from contract key
  const timelineEntries = useMemo(() => {
    if (!selectedTarget) return [];
    return allEntries
      .filter((e) => extractTargetKey(e.contractKey) === selectedTarget)
      .sort((a, b) => evidenceRank(a.evidenceLevel) - evidenceRank(b.evidenceLevel));
  }, [allEntries, selectedTarget]);

  // [issue 2] Evidence rows for selected model — use selectedTarget only
  const evidenceRows = useMemo(() => {
    if (!selectedTarget || !attackDefense) return [];
    return attackDefense.rows.filter(
      (r) => r.model === selectedTarget,
    );
  }, [attackDefense, selectedTarget]);

  const totalEvidencePages = Math.max(1, Math.ceil(evidenceRows.length / PAGE_SIZE));

  // [issue 7] Clamp evidencePage when totalEvidencePages changes
  useEffect(() => {
    if (evidencePage > totalEvidencePages) {
      setEvidencePage(totalEvidencePages);
    }
  }, [evidencePage, totalEvidencePages]);

  const paginatedEvidenceRows = useMemo(() => {
    const start = (evidencePage - 1) * PAGE_SIZE;
    return evidenceRows.slice(start, start + PAGE_SIZE);
  }, [evidenceRows, evidencePage]);

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* LEFT: Model List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Search + Add Model */}
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={copy.searchModels}
                className="w-full rounded-[10px] border border-border bg-background py-2 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-[var(--accent-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]/20 transition-colors"
              />
              {/* [issue 8] Search clear button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label={copy.clearSearch}
                  title={copy.clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  <X size={12} strokeWidth={1.5} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="workspace-btn-primary shrink-0 text-xs px-3 py-1.5 flex items-center gap-1"
            >
              <Plus size={12} strokeWidth={1.5} />
              {copy.addModel}
            </button>
          </div>
        </div>

        {/* Model list */}
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
          {localCatalog.tracks.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">{copy.emptyNav}</p>
          ) : (
            <div className="p-2">
              {localCatalog.tracks.map((track) => {
                const entries = entriesByTrack.get(track.track) ?? [];
                if (entries.length === 0) return null;
                const dotColor = TRACK_DOT_COLORS[track.track] ?? "var(--muted-foreground)";

                return (
                  <div key={track.track} className="mb-2">
                    {/* Track header */}
                    <div className="flex items-center gap-2 px-2.5 py-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: dotColor }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {TRACK_DISPLAY[track.track] ?? track.track}
                      </span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{entries.length}</span>
                    </div>
                    {/* Entries */}
                    {entries.map((entry) => {
                      const isSelected = selectedEntry?.contractKey === entry.contractKey;
                      return (
                        <button
                          key={entry.contractKey}
                          type="button"
                          onClick={() => { setSelectedEntry(entry); setActiveTab("timeline"); setEvidencePage(1); }}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                            isSelected
                              ? "bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20"
                              : "border border-transparent hover:bg-muted/30"
                          }`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isSelected ? "bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]" : "bg-muted/30 text-muted-foreground"
                          }`}>
                            <Database size={14} strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-foreground truncate">{entry.label}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{entry.capabilityLabel}</div>
                          </div>
                          <StatusBadge tone={availabilityTone(entry.availability)} compact>{copy.availabilityLabels[entry.availability] ?? entry.availability}</StatusBadge>
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {/* [issue 3] No search results message */}
              {filteredEntries.length === 0 && searchQuery.trim() && (
                <p className="px-4 py-8 text-center text-xs text-muted-foreground">{copy.noSearchResults}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Model Details */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {!selectedEntry ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">{copy.emptyTimeline}</p>
          </div>
        ) : (
          <>
            {/* Model header */}
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
                  <Database size={18} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground truncate">{selectedEntry.label}</h3>
                  <p className="text-[11px] text-muted-foreground truncate">{selectedEntry.capabilityLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={availabilityTone(selectedEntry.availability)}>{copy.availabilityLabels[selectedEntry.availability] ?? selectedEntry.availability}</StatusBadge>
                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    title={copy.edit}
                    className="rounded-lg border border-border/60 bg-background/60 p-1.5 text-muted-foreground transition-all hover:border-[var(--accent-blue)]/30 hover:text-[var(--accent-blue)] dark:bg-background/40"
                  >
                    <Pencil size={14} strokeWidth={1.5} />
                  </button>
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={handleOpenDelete}
                    title={copy.delete}
                    className="rounded-lg border border-border/60 bg-background/60 p-1.5 text-muted-foreground transition-all hover:border-[var(--accent-coral)]/30 hover:text-[var(--accent-coral)] dark:bg-background/40"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              {/* Demo mode note */}
              <p className="mt-2 text-[10px] text-muted-foreground/60">{copy.demoModeNote}</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => setActiveTab("timeline")}
                className={`px-5 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === "timeline"
                    ? "border-b-2 border-[var(--accent-blue)] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {copy.tabTimeline} ({timelineEntries.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("evidence")}
                className={`px-5 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === "evidence"
                    ? "border-b-2 border-[var(--accent-blue)] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {copy.tabEvidence} ({evidenceRows.length})
              </button>
            </div>

            {/* Tab content */}
            <div className="p-5">
              {activeTab === "timeline" ? (
                /* Version Timeline */
                timelineEntries.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">{copy.emptyTimeline}</p>
                ) : (
                  <div className="space-y-3">
                    {timelineEntries.map((entry, index) => {
                      const isBestEvidence = index === 0;
                      return (
                        <div key={entry.contractKey} className="flex gap-4 rounded-lg border border-border/60 p-4 transition-colors hover:border-border">
                          <div className="flex flex-col items-center">
                            <div className={`h-3 w-3 rounded-full ${isBestEvidence ? "bg-[var(--accent-blue)]" : "bg-border"}`} />
                            {index < timelineEntries.length - 1 && <div className="w-[2px] flex-1 bg-border/40 mt-1" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-foreground">{entry.label}</span>
                              {/* [issue 5] Changed from "Current" to "Best Evidence" */}
                              {isBestEvidence && (
                                <span className="inline-flex items-center rounded-full bg-[var(--accent-blue)]/10 px-2 py-0.5 text-[9px] font-semibold text-[var(--accent-blue)]">{copy.bestEvidence}</span>
                              )}
                              <StatusBadge tone={availabilityTone(entry.availability)} compact>{copy.availabilityLabels[entry.availability] ?? entry.availability}</StatusBadge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-2">
                              {/* [issue 6] Only render fields with real values */}
                              {entry.runtimeLabel && (
                                <div>
                                  <div className="text-[10px] text-muted-foreground">{copy.runtime}</div>
                                  <div className="text-[11px] font-medium text-foreground">{entry.runtimeLabel}</div>
                                </div>
                              )}
                              {entry.evidenceLevel && (
                                <div>
                                  <div className="text-[10px] text-muted-foreground">{copy.evidenceLevel}</div>
                                  <div className="text-[11px] font-medium text-foreground">{copy.evidenceLevelLabels[entry.evidenceLevel] ?? entry.evidenceLevel}</div>
                                </div>
                              )}
                              {entry.bestWorkspace && (
                                <div>
                                  <div className="text-[10px] text-muted-foreground">{copy.workspace}</div>
                                  <div className="text-[11px] font-medium text-foreground truncate">{entry.bestWorkspace}</div>
                                </div>
                              )}
                            </div>
                            {entry.systemGap && (
                              <p className="mt-2 text-[10px] text-muted-foreground border-t border-border/40 pt-2">{entry.systemGap}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Evidence Table */
                evidenceRows.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">{copy.emptyEvidence}</p>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-border/60">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="border-b border-border/60 bg-muted/20 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            <th className="px-4 py-3">{copy.attack}</th>
                            <th className="px-4 py-3">{copy.defense}</th>
                            <th className="px-4 py-3 text-right">{copy.auc}</th>
                            <th className="px-4 py-3 text-right">{copy.asr}</th>
                            <th className="px-4 py-3 text-right">{copy.tpr}</th>
                            <th className="px-4 py-3">{copy.source}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedEvidenceRows.map((row, index) => (
                            <tr key={`${row.attack}-${row.defense}-${index}`} className="border-b border-border/30 transition-colors hover:bg-muted/20">
                              <td className="px-4 py-3 font-medium text-foreground">{row.attack}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.defense}</td>
                              <td className="mono px-4 py-3 text-right text-foreground">{row.aucLabel}</td>
                              <td className="mono px-4 py-3 text-right text-foreground">{row.asrLabel}</td>
                              <td className="mono px-4 py-3 text-right text-foreground">{row.tprLabel}</td>
                              <td className="px-4 py-3 text-muted-foreground truncate max-w-[120px]">{row.sourcePath ?? "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalEvidencePages > 1 && (
                      <div className="flex items-center justify-center gap-1.5 mt-3">
                        <button type="button" disabled={evidencePage <= 1} onClick={() => setEvidencePage((p) => Math.max(1, p - 1))} className="rounded p-1 text-muted-foreground hover:bg-muted/30 disabled:opacity-30 transition-colors">
                          <ChevronLeft size={12} strokeWidth={1.5} />
                        </button>
                        {Array.from({ length: totalEvidencePages }, (_, i) => i + 1).map((page) => (
                          <button key={page} type="button" onClick={() => setEvidencePage(page)} className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${page === evidencePage ? "bg-[var(--accent-blue)] text-white" : "text-muted-foreground hover:bg-muted/30"}`}>
                            {page}
                          </button>
                        ))}
                        <button type="button" disabled={evidencePage >= totalEvidencePages} onClick={() => setEvidencePage((p) => Math.min(totalEvidencePages, p + 1))} className="rounded p-1 text-muted-foreground hover:bg-muted/30 disabled:opacity-30 transition-colors">
                          <ChevronRight size={12} strokeWidth={1.5} />
                        </button>
                      </div>
                    )}
                  </>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Model Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={copy.addModelTitle}
        closeLabel={copy.cancel}
        actions={
          <>
            <button type="button" onClick={() => setShowAddModal(false)} className="workspace-btn-secondary px-4 py-2 text-xs">
              {copy.cancel}
            </button>
            <button type="submit" form="add-model-form" className="workspace-btn-primary px-4 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40">
              {copy.submit}
            </button>
          </>
        }
      >
        <form id="add-model-form" onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label htmlFor="add-model-name" className="block text-xs font-medium text-foreground mb-1.5">{copy.modelName}</label>
            <input
              id="add-model-name"
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={copy.modelNamePlaceholder}
              required
              className="settings-input w-full"
            />
          </div>
          <div>
            <label htmlFor="add-model-track" className="block text-xs font-medium text-foreground mb-1.5">{copy.modelTrack}</label>
            <select
              id="add-model-track"
              value={formTrack}
              onChange={(e) => setFormTrack(e.target.value)}
              className="settings-input w-full"
            >
              {TRACK_OPTIONS.map((t) => (
                <option key={t} value={t}>{TRACK_DISPLAY[t] ?? t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">{copy.uploadFile}</label>
            {uploadComplete ? (
              <div className="flex items-center gap-2 rounded-[10px] border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/5 px-3 py-2.5 text-xs">
                <Check size={14} strokeWidth={1.5} className="shrink-0 text-[var(--accent-green)]" />
                <span className="text-[var(--accent-green)] font-medium">{copy.uploadComplete}</span>
              </div>
            ) : uploadProgress !== null ? (
              <div className="rounded-[10px] border border-border px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-muted-foreground">{copy.uploadProgress}</span>
                  <span className="text-[11px] font-medium text-foreground">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent-blue)] transition-all duration-100 ease-linear"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulateUpload}
                className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-border px-3 py-5 text-xs text-muted-foreground hover:border-[var(--accent-blue)]/30 hover:text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/5 transition-colors cursor-pointer"
              >
                <Upload size={16} strokeWidth={1.5} />
                {copy.uploadDragDrop}
              </button>
            )}
          </div>
          <div>
            <label htmlFor="add-model-desc" className="block text-xs font-medium text-foreground mb-1.5">{copy.modelDescription}</label>
            <textarea
              id="add-model-desc"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={copy.modelDescriptionPlaceholder}
              rows={3}
              className="settings-input w-full resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Edit Model Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={copy.editModelTitle}
        closeLabel={copy.cancel}
        actions={
          <>
            <button type="button" onClick={() => setShowEditModal(false)} className="workspace-btn-secondary px-4 py-2 text-xs">
              {copy.cancel}
            </button>
            <button type="submit" form="edit-model-form" className="workspace-btn-primary px-4 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40">
              {copy.submit}
            </button>
          </>
        }
      >
        <form id="edit-model-form" onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-model-name" className="block text-xs font-medium text-foreground mb-1.5">{copy.modelName}</label>
            <input
              id="edit-model-name"
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={copy.modelNamePlaceholder}
              required
              className="settings-input w-full"
            />
          </div>
          <div>
            <label htmlFor="edit-model-desc" className="block text-xs font-medium text-foreground mb-1.5">{copy.modelDescription}</label>
            <textarea
              id="edit-model-desc"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={copy.modelDescriptionPlaceholder}
              rows={3}
              className="settings-input w-full resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h3 id="delete-dialog-title" className="text-sm font-semibold text-foreground">{copy.deleteModelTitle}</h3>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">{copy.deleteModelConfirm}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="workspace-btn-secondary px-3 py-2 text-xs"
              >
                {copy.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-[var(--accent-coral)] px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                {copy.deleteModelAction}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
