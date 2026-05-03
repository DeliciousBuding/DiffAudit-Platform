"use client";

import { FileText, AlertTriangle, Shield, BarChart3, Search, X, ChevronLeft, ChevronRight, Layers, Tag, LayoutGrid, CheckCircle2, ShieldCheck } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ContextualTip } from "@/components/contextual-tip";
import { EmptyState } from "@/components/empty-state";
import { InfoTooltip } from "@/components/info-tooltip";
import { SortableHeader } from "@/components/sortable-header";
import { StatusBadge } from "@/components/status-badge";
import { TableDensityToggle, readPersistedDensity, densityClass, type Density } from "@/components/table-density-toggle";
import { WorkspaceSectionCard } from "@/components/workspace-frame";
import { useSort } from "@/hooks/use-sort";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import type { AttackDefenseRowViewModel } from "@/lib/workspace-source";
import type { Locale } from "@/components/language-picker";
import { FindingDetailPanel } from "./FindingDetailPanel";

/* ------------------------------------------------------------------ */
/*  Localized copy                                                     */
/* ------------------------------------------------------------------ */

const COPY: Record<string, {
  totalFindings: string;
  highRisk: string;
  hasDefense: string;
  defenseRate: string;
  na: string;
  allSeverities: string;
  allCategories: string;
  allModels: string;
  allStatuses: string;
  riskDescription: string;
  severity: string;
  category: string;
  sourceModel: string;
  status: string;
  detected: string;
  estimated: string;
  noDataYet: string;
  high: string;
  medium: string;
  low: string;
  hasDefenseStatus: string;
  monitoring: string;
  investigating: string;
  previous: string;
  next: string;
  emptyNoData: string;
  emptyNoResults: string;
  findingsTable: string;
  catBlackBox: string;
  catGrayBox: string;
  catWhiteBox: string;
  catOther: string;
  clearFilters: string;
  clearSearch: string;
  searchPlaceholder: string;
  createAuditTask: string;
  presetAll: string;
  presetHighUnmitigated: string;
  presetMitigated: string;
  presetHighAuc: string;
}> = {
  "en-US": {
    totalFindings: "Total Findings",
    highRisk: "High Risk",
    hasDefense: "Has Defense",
    defenseRate: "Defense Rate",
    na: "N/A",
    allSeverities: "All Severities",
    allCategories: "All Categories",
    allModels: "All Models",
    allStatuses: "All Statuses",
    riskDescription: "Risk Description",
    severity: "Severity",
    category: "Category",
    sourceModel: "Source Model",
    status: "Status",
    detected: "Detected",
    estimated: "Est.",
    noDataYet: "no data yet",
    high: "High",
    medium: "Medium",
    low: "Low",
    hasDefenseStatus: "Has Defense",
    monitoring: "Monitoring",
    investigating: "Investigating",
    previous: "Previous",
    next: "Next",
    emptyNoData: "No risk findings available.",
    emptyNoResults: "No findings match the current filters.",
    findingsTable: "Findings",
    catBlackBox: "Privacy Leakage",
    catGrayBox: "Data Exposure",
    catWhiteBox: "Prompt Security",
    catOther: "Safety Bypass",
    clearFilters: "Clear filters",
    clearSearch: "Clear search",
    searchPlaceholder: "Search by description or model...",
    createAuditTask: "Create audit task",
    presetAll: "All",
    presetHighUnmitigated: "High Risk Unmitigated",
    presetMitigated: "Mitigated",
    presetHighAuc: "High AUC",
  },
  "zh-CN": {
    totalFindings: "发现总数",
    highRisk: "高危",
    hasDefense: "已有防御",
    defenseRate: "防御率",
    na: "暂无",
    allSeverities: "全部严重度",
    allCategories: "全部类别",
    allModels: "全部模型",
    allStatuses: "全部状态",
    riskDescription: "风险描述",
    severity: "严重度",
    category: "类别",
    sourceModel: "来源模型",
    status: "状态",
    detected: "发现时间",
    estimated: "估",
    noDataYet: "暂无数据",
    high: "高",
    medium: "中",
    low: "低",
    hasDefenseStatus: "已有防御",
    monitoring: "监控中",
    investigating: "调查中",
    previous: "上一页",
    next: "下一页",
    emptyNoData: "暂无风险发现。",
    emptyNoResults: "没有符合当前筛选条件的发现。",
    findingsTable: "发现列表",
    catBlackBox: "隐私泄露",
    catGrayBox: "数据暴露",
    catWhiteBox: "提示安全",
    catOther: "安全绕过",
    clearFilters: "清除筛选",
    clearSearch: "清除搜索",
    searchPlaceholder: "搜索描述或模型...",
    createAuditTask: "创建审计任务",
    presetAll: "全部",
    presetHighUnmitigated: "高危未防御",
    presetMitigated: "已有防御",
    presetHighAuc: "高 AUC",
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Map track name to a display label. Preserves the original track name when
 *  it does not match a known category so the user sees the actual value. */
function getCategory(track: string, copy: typeof COPY[string]): string {
  if (track === "black-box") return copy.catBlackBox;
  if (track === "gray-box") return copy.catGrayBox;
  if (track === "white-box") return copy.catWhiteBox;
  if (track === "other") return copy.catOther;
  // Unknown track -- show raw value
  return track;
}

function getStatus(defense: string, riskLevel: string): string {
  if (defense !== "none") return "has-defense";
  if (riskLevel === "high") return "investigating";
  return "monitoring";
}

/* ------------------------------------------------------------------ */
/*  Localized risk description map                                     */
/* ------------------------------------------------------------------ */

const RISK_NOTE_ZH: Record<string, string> = {
  "Photoreal face generations show stronger memorization on member portraits.":
    "人脸生成模型对成员肖像表现出更强的记忆效应。",
  "White-box gradients expose memorized waveform fragments without mitigation.":
    "白盒梯度暴露了未缓解的记忆波形片段。",
  "Black-box membership inference via loss deviation. High AUC indicates significant leakage.":
    "基于损失偏差的黑盒成员推断攻击。高 AUC 表明存在显著泄露。",
  "Gray-box posterior deviation attack. High ASR shows gradient leakage is exploitable.":
    "灰盒后验偏差攻击。高 ASR 表明梯度泄露可被利用。",
  "Rare-class lesion samples remain highly vulnerable to posterior attacks.":
    "罕见类病变样本对后验攻击仍然高度脆弱。",
  "Stochastic dropout at all steps reduces ASR by ~15pp with moderate overhead.":
    "全步骤随机丢弃将 ASR 降低约 15 个百分点，开销适中。",
  "Lower AUC on PixelArt suggests stronger baseline privacy.":
    "PixelArt 上较低的 AUC 表明基线隐私保护更强。",
  "Gradient leakage present but lower magnitude than SD v1.4.":
    "存在梯度泄露但幅度低于 SD v1.4。",
  "SMP-LoRA shows stronger mitigation under gray-box attack.":
    "SMP-LoRA 在灰盒攻击下表现出更强的缓解效果。",
  "Clip-guided sanitization lowers leakage while keeping prompt fidelity acceptable.":
    "Clip 引导的净化降低了泄露，同时保持提示保真度在可接受水平。",
};

function getRiskDescription(attack: string, note: string, locale: string): string {
  if (note && note.length > 10) {
    if (locale === "zh-CN" && RISK_NOTE_ZH[note]) {
      return RISK_NOTE_ZH[note];
    }
    return note;
  }
  return attack;
}

/* ------------------------------------------------------------------ */
/*  Pagination window helper                                           */
/* ------------------------------------------------------------------ */

function getPaginationWindow(current: number, total: number, maxVisible: number): number[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/* ------------------------------------------------------------------ */
/*  KPI Card                                                           */
/* ------------------------------------------------------------------ */

function KpiCard({ label, value, accent, icon }: { label: React.ReactNode; value: string | number; accent: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `color-mix(in srgb, ${accent} 10%, transparent)`, color: accent }}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold leading-tight text-foreground">{value}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick filter presets                                                */
/* ------------------------------------------------------------------ */

type QuickFilterId = "all" | "high-unmitigated" | "mitigated" | "high-auc";

type QuickFilterPreset = {
  id: QuickFilterId;
  labelKey: keyof typeof COPY["en-US"];
  severity: string;
  status: string;
};

const QUICK_FILTERS: QuickFilterPreset[] = [
  { id: "all", labelKey: "presetAll", severity: "", status: "" },
  { id: "high-unmitigated", labelKey: "presetHighUnmitigated", severity: "high", status: "investigating" },
  { id: "mitigated", labelKey: "presetMitigated", severity: "", status: "has-defense" },
  { id: "high-auc", labelKey: "presetHighAuc", severity: "high", status: "" },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

type Props = {
  rows: AttackDefenseRowViewModel[];
  locale: Locale;
};

export function RiskFindingsClient({ rows, locale }: Props) {
  const copy = COPY[locale] ?? COPY["en-US"];
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlSyncSource = useRef<"state" | "url">("state");
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get("page"));
    return page > 0 ? page : 1;
  });

  /* -- KPI data ---------------------------------------------------- */
  const totalFindings = rows.length;
  const criticalHigh = rows.filter((r) => r.riskLevel === "high").length;
  const resolvedCount = rows.filter((r) => r.defense !== "none").length;
  const defenseRate = totalFindings > 0 ? Math.round((resolvedCount / totalFindings) * 100) : null;

  /* -- filter state (initialized from URL params) ------------------ */
  const [severityFilter, setSeverityFilter] = useState(() => {
    const v = searchParams.get("severity");
    return v === "high" || v === "medium" || v === "low" ? v : "";
  });
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get("category") ?? "");
  const [modelFilter, setModelFilter] = useState(() => searchParams.get("model") ?? "");
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") ?? "");
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const hasActiveFilters = severityFilter || categoryFilter || modelFilter || statusFilter || searchQuery.trim();

  /* -- table density ------------------------------------------------ */
  const DENSITY_KEY = "diffaudit-risk-density";
  const [density, setDensity] = useState<Density>(() => readPersistedDensity(DENSITY_KEY));
  useEffect(() => {
    localStorage.setItem(DENSITY_KEY, density);
  }, [density]);

  /* -- selected finding for detail panel ---------------------------- */
  const [selectedFinding, setSelectedFinding] = useState<AttackDefenseRowViewModel | null>(null);

  /* -- quick filter preset state ------------------------------------ */
  const [activePreset, setActivePreset] = useState<QuickFilterId | null>("all");

  /* -- unified filter change handler (resets pagination, clears preset) -- */
  const handleFilterChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
      setter(value);
      setActivePreset(null);
      setCurrentPage(1);
    },
    [],
  );

  /* -- apply a quick filter preset ---------------------------------- */
  const applyPreset = useCallback((preset: QuickFilterPreset) => {
    setActivePreset(preset.id);
    setSeverityFilter(preset.severity);
    setStatusFilter(preset.status);
    // Presets only control severity + status; clear category/model for a clean view
    setCategoryFilter("");
    setModelFilter("");
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  /* -- clear all filters ------------------------------------------ */
  const clearAllFilters = useCallback(() => {
    setSeverityFilter("");
    setCategoryFilter("");
    setModelFilter("");
    setStatusFilter("");
    setSearchQuery("");
    setActivePreset("all");
    setCurrentPage(1);
  }, []);

  /* -- filtered rows ----------------------------------------------- */
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (severityFilter && r.riskLevel !== severityFilter) return false;
        if (categoryFilter && r.track !== categoryFilter) return false;
        if (modelFilter && r.model !== modelFilter) return false;
        if (statusFilter && getStatus(r.defense, r.riskLevel) !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const desc = getRiskDescription(r.attack, r.note ?? "", locale).toLowerCase();
          const model = r.model.toLowerCase();
          if (!desc.includes(q) && !model.includes(q)) return false;
        }
        return true;
      }),
    [rows, severityFilter, categoryFilter, modelFilter, statusFilter, searchQuery, locale],
  );

  /* -- enriched rows with sortable computed fields ----------------- */
  const SEVERITY_SCORE: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const enrichedRows = useMemo(
    () =>
      filtered.map((r) => ({
        ...r,
        severityScore: SEVERITY_SCORE[r.riskLevel] ?? 0,
        statusKey: getStatus(r.defense, r.riskLevel),
      })),
    [filtered],
  );

  /* -- sorting ----------------------------------------------------- */
  const { sorted, sortKey, sortDir, toggleSort } = useSort(enrichedRows);

  /* -- pagination -------------------------------------------------- */
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginatedRows = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /* -- clamp currentPage when rows change ------------------------- */
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  /* -- sync state -> URL -------------------------------------------- */
  useEffect(() => {
    if (urlSyncSource.current === "url") {
      urlSyncSource.current = "state";
      return;
    }
    const sp = new URLSearchParams();
    if (severityFilter) sp.set("severity", severityFilter);
    if (categoryFilter) sp.set("category", categoryFilter);
    if (modelFilter) sp.set("model", modelFilter);
    if (statusFilter) sp.set("status", statusFilter);
    if (searchQuery.trim()) sp.set("q", searchQuery.trim());
    if (currentPage > 1) sp.set("page", String(currentPage));
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [severityFilter, categoryFilter, modelFilter, statusFilter, searchQuery, currentPage, pathname, router]);

  /* -- sync URL -> state (back/forward navigation) ----------------- */
  useEffect(() => {
    const urlSeverity = searchParams.get("severity") ?? "";
    const urlCategory = searchParams.get("category") ?? "";
    const urlModel = searchParams.get("model") ?? "";
    const urlStatus = searchParams.get("status") ?? "";
    const urlQ = searchParams.get("q") ?? "";
    const urlPage = Number(searchParams.get("page")) || 1;

    const validSeverity =
      urlSeverity === "high" || urlSeverity === "medium" || urlSeverity === "low" ? urlSeverity : "";

    urlSyncSource.current = "url";
    setSeverityFilter(validSeverity);
    setCategoryFilter(urlCategory);
    setModelFilter(urlModel);
    setStatusFilter(urlStatus);
    setSearchQuery(urlQ);
    setCurrentPage(urlPage > 0 ? urlPage : 1);

    // Derive active preset from URL params
    const matchedPreset = QUICK_FILTERS.find(
      (p) => p.severity === validSeverity && p.status === urlStatus && !urlCategory && !urlModel && !urlQ.trim(),
    );
    setActivePreset(matchedPreset?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* -- unique values for filters ----------------------------------- */
  const severities = useMemo(() => [...new Set(rows.map((r) => r.riskLevel))].sort(), [rows]);
  const trackValues = useMemo(() => [...new Set(rows.map((r) => r.track))].sort(), [rows]);
  const models = useMemo(() => [...new Set(rows.map((r) => r.model))].sort(), [rows]);
  const statuses = useMemo(() => [...new Set(rows.map((r) => getStatus(r.defense, r.riskLevel)))].sort(), [rows]);

  /* -- responsive pagination window -------------------------------- */
  const [maxVisiblePages, setMaxVisiblePages] = useState(5);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setMaxVisiblePages(mq.matches ? 3 : 5);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const pageWindow = getPaginationWindow(currentPage, totalPages, maxVisiblePages);

  /* -- scroll container ref for fade gradient ---------------------- */
  const tableScrollRef = useRef<HTMLDivElement>(null);
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
  }, [filtered]);

  /* -- localized number formatter ---------------------------------- */
  const nf = useMemo(() => new Intl.NumberFormat(locale === "zh-CN" ? "zh-CN" : "en-US"), [locale]);

  /* -- render ------------------------------------------------------ */
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={copy.totalFindings}
          value={nf.format(totalFindings)}
          accent="var(--info)"
          icon={<FileText size={16} strokeWidth={1.5} aria-hidden="true" />}
        />
        <KpiCard
          label={copy.highRisk}
          value={nf.format(criticalHigh)}
          accent="var(--warning)"
          icon={<AlertTriangle size={16} strokeWidth={1.5} aria-hidden="true" />}
        />
        <KpiCard
          label={copy.hasDefense}
          value={nf.format(resolvedCount)}
          accent="var(--success)"
          icon={<Shield size={16} strokeWidth={1.5} aria-hidden="true" />}
        />
        <KpiCard
          label={<InfoTooltip content={WORKSPACE_COPY[locale].tooltips.defenseRate}>{copy.defenseRate}</InfoTooltip>}
          value={defenseRate !== null ? `${defenseRate}%` : copy.na}
          accent="var(--accent-blue)"
          icon={<BarChart3 size={16} strokeWidth={1.5} aria-hidden="true" />}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60" />

      {/* Quick Filter Presets */}
      <div className="flex flex-wrap items-center gap-2">
        {QUICK_FILTERS.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`rounded-xl px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-[var(--accent-blue)] text-white shadow-sm"
                  : "border border-border text-muted-foreground hover:border-[var(--accent-blue)]/40 hover:text-foreground"
              }`}
            >
              {copy[preset.labelKey]}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 px-5 py-3.5">
          {/* Search input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none sm:w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={14} strokeWidth={1.5} aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setActivePreset(null); setCurrentPage(1); }}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-[var(--accent-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]/20 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setActivePreset(null); setCurrentPage(1); }}
                aria-label={copy.clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <X size={12} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Separator */}
          <div className="hidden sm:block h-6 w-px bg-border/60" />

          {/* Filter selects */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Layers className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={13} strokeWidth={1.5} aria-hidden="true" />
              <select
                className="workspace-filter-select appearance-none pl-8 pr-8"
                value={severityFilter}
                onChange={(e) => handleFilterChange(setSeverityFilter, e.target.value)}
                aria-label={copy.allSeverities}
              >
                <option value="">{copy.allSeverities}</option>
                {severities.map((s) => <option key={s} value={s}>{s === "high" ? copy.high : s === "medium" ? copy.medium : copy.low}</option>)}
              </select>
            </div>
            <div className="relative">
              <Tag className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={13} strokeWidth={1.5} aria-hidden="true" />
              <select
                className="workspace-filter-select appearance-none pl-8 pr-8"
                value={categoryFilter}
                onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
                aria-label={copy.allCategories}
              >
                <option value="">{copy.allCategories}</option>
                {trackValues.map((t) => <option key={t} value={t}>{getCategory(t, copy)}</option>)}
              </select>
            </div>
            <div className="relative">
              <LayoutGrid className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={13} strokeWidth={1.5} aria-hidden="true" />
              <select
                className="workspace-filter-select appearance-none pl-8 pr-8"
                value={modelFilter}
                onChange={(e) => handleFilterChange(setModelFilter, e.target.value)}
                aria-label={copy.allModels}
              >
                <option value="">{copy.allModels}</option>
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="relative">
              <CheckCircle2 className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={13} strokeWidth={1.5} aria-hidden="true" />
              <select
                className="workspace-filter-select appearance-none pl-8 pr-8"
                value={statusFilter}
                onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                aria-label={copy.allStatuses}
              >
                <option value="">{copy.allStatuses}</option>
                {statuses.map((s) => <option key={s} value={s}>{s === "has-defense" ? copy.hasDefenseStatus : s === "monitoring" ? copy.monitoring : copy.investigating}</option>)}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              {copy.clearFilters}
            </button>
          )}
          {!hasActiveFilters && <div className="ml-auto" />}
          <TableDensityToggle density={density} onChange={setDensity} />
        </div>
      </div>

      {/* Table */}
      <ContextualTip id="risk-findings-row-click" locale={locale}>
        {locale === "zh-CN" ? "点击表格行可查看完整风险详情，包括指标、防御信息和来源。" : "Click any table row to see full risk details, including metrics, defense info, and provenance."}
      </ContextualTip>
      <WorkspaceSectionCard title={copy.findingsTable}>
        {filtered.length > 0 ? (
          <div
            ref={tableScrollRef}
            className="workspace-table-scroll"
            role="region"
            aria-label={copy.findingsTable}
          >
            <table className={`w-full text-[13px] ${densityClass(density)}`}>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground min-w-[220px]">{copy.riskDescription}</th>
                  <SortableHeader label={copy.severity} sortKey="severityScore" currentSort={sortKey} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label={<InfoTooltip content={WORKSPACE_COPY[locale].tooltips.auc}>AUC</InfoTooltip>} sortKey="aucLabel" currentSort={sortKey} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label={<InfoTooltip content={WORKSPACE_COPY[locale].tooltips.asr}>ASR</InfoTooltip>} sortKey="asrLabel" currentSort={sortKey} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label={copy.category} sortKey="track" currentSort={sortKey} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label={copy.sourceModel} sortKey="model" currentSort={sortKey} currentDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label={copy.status} sortKey="statusKey" currentSort={sortKey} currentDir={sortDir} onSort={toggleSort} />
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, rowIndex) => {
                  const status = getStatus(row.defense, row.riskLevel);
                  const severityBorder = row.riskLevel === "high"
                    ? "border-l-[var(--risk-high)]"
                    : row.riskLevel === "medium"
                      ? "border-l-[var(--warning)]"
                      : "border-l-[var(--success)]";
                  const severityBg = row.riskLevel === "high"
                    ? "bg-[var(--risk-high)]/[0.02]"
                    : row.riskLevel === "medium"
                      ? "bg-[var(--warning)]/[0.02]"
                      : "";
                  return (
                    <tr
                      key={`${row.track}-${row.attack}-${row.defense}-${row.model}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedFinding(row)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedFinding(row);
                        }
                      }}
                      className={`cursor-pointer border-b border-border/40 border-l-2 transition-colors hover:bg-muted/20 ${severityBorder} ${severityBg} ${rowIndex % 2 === 1 ? "bg-muted/[0.04]" : ""} ${selectedFinding && selectedFinding.track === row.track && selectedFinding.attack === row.attack && selectedFinding.model === row.model ? "workspace-row-selected" : ""}`}
                    >
                      <td className="max-w-[280px] px-4 py-3">
                        <div className="font-medium text-foreground">{getRiskDescription(row.attack, row.note ?? "", locale)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={row.riskLevel === "high" ? "warning" : row.riskLevel === "medium" ? "info" : "success"}>
                          {row.riskLevel === "high" ? copy.high : row.riskLevel === "medium" ? copy.medium : copy.low}
                        </StatusBadge>
                      </td>
                      <td className={`mono px-4 py-3 text-[12px] ${parseFloat(row.aucLabel) > 0.85 ? "text-[color:var(--risk-high)] font-medium" : parseFloat(row.aucLabel) > 0.7 ? "text-[color:var(--warning)]" : "text-muted-foreground"}`}>{row.aucLabel || "--"}</td>
                      <td className={`mono px-4 py-3 text-[12px] ${parseFloat(row.asrLabel) > 0.5 ? "text-[color:var(--risk-high)] font-medium" : parseFloat(row.asrLabel) > 0.3 ? "text-[color:var(--warning)]" : "text-muted-foreground"}`}>{row.asrLabel || "--"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{getCategory(row.track, copy)}</td>
                      <td className="mono px-4 py-3 text-[12px]">{row.model}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={status === "has-defense" ? "success" : status === "monitoring" ? "info" : "warning"}>
                          {status === "has-defense" ? copy.hasDefenseStatus : status === "monitoring" ? copy.monitoring : copy.investigating}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          hasActiveFilters ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-3 text-muted-foreground/30" size={40} strokeWidth={1.2} aria-hidden="true" />
              <p className="text-sm text-muted-foreground">{copy.emptyNoResults}</p>
            </div>
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title={copy.emptyNoData}
              description={locale === "zh-CN" ? "完成审计任务后，风险发现将显示在此处。" : "Risk findings will appear here after completing audit tasks."}
              action={{ label: copy.createAuditTask, href: "/workspace/audits/new" }}
            />
          )
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <span className="text-[11px] text-muted-foreground">
              {nf.format(sorted.length)} {copy.totalFindings.toLowerCase()}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label={copy.previous}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/30 disabled:opacity-30"
              >
                <ChevronLeft size={14} strokeWidth={1.5} />
              </button>
              {pageWindow[0] > 1 && (
                <span className="text-xs text-muted-foreground/50">...</span>
              )}
              {pageWindow.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors ${
                    page === currentPage
                      ? "bg-[var(--accent-blue)] text-white shadow-sm"
                      : "text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  {page}
                </button>
              ))}
              {pageWindow[pageWindow.length - 1] < totalPages && (
                <span className="text-xs text-muted-foreground/50">...</span>
              )}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label={copy.next}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/30 disabled:opacity-30"
              >
                <ChevronRight size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </WorkspaceSectionCard>

      {/* Finding detail slide-over panel */}
      <FindingDetailPanel
        finding={selectedFinding}
        locale={locale}
        onClose={() => setSelectedFinding(null)}
      />
    </div>
  );
}
