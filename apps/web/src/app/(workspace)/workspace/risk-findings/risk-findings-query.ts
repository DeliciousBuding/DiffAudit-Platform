export type SeverityFilter = "" | "high" | "medium" | "low";

export type RiskQueryState = {
  severityFilter: SeverityFilter;
  categoryFilter: string;
  modelFilter: string;
  statusFilter: string;
  searchQuery: string;
  page: number;
};

type SearchParamsLike = {
  get(name: string): string | null;
};

export function normalizeSeverity(value: string | null): SeverityFilter {
  return value === "high" || value === "medium" || value === "low" ? value : "";
}

export function normalizePage(value: string | number | null): number {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export function parseRiskQuery(searchParams: SearchParamsLike): RiskQueryState {
  return {
    severityFilter: normalizeSeverity(searchParams.get("severity")),
    categoryFilter: searchParams.get("category") ?? "",
    modelFilter: searchParams.get("model") ?? "",
    statusFilter: searchParams.get("status") ?? "",
    searchQuery: searchParams.get("q") ?? "",
    page: normalizePage(searchParams.get("page")),
  };
}

export function buildRiskQueryString(state: RiskQueryState): string {
  const sp = new URLSearchParams();
  if (state.severityFilter) sp.set("severity", state.severityFilter);
  if (state.categoryFilter) sp.set("category", state.categoryFilter);
  if (state.modelFilter) sp.set("model", state.modelFilter);
  if (state.statusFilter) sp.set("status", state.statusFilter);
  if (state.searchQuery.trim()) sp.set("q", state.searchQuery.trim());
  if (state.page > 1) sp.set("page", String(state.page));
  return sp.toString();
}
