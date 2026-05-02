import { type Locale } from "@/components/language-picker";

/**
 * Format an ISO date string for display in task lists and compact views.
 * Includes month, day, hour, minute. Omits year for brevity.
 */
export function formatCompactTime(iso: string, locale: Locale): string {
  try {
    const tag = locale === "zh-CN" ? "zh-CN" : "en-US";
    return new Date(iso).toLocaleString(tag, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

/**
 * Format an ISO date string for display in detail views.
 * Includes year, month, day, hour, minute, second.
 */
export function formatFullTime(iso: string, locale: Locale): string {
  try {
    const tag = locale === "zh-CN" ? "zh-CN" : "en-US";
    return new Date(iso).toLocaleString(tag, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

/**
 * Format a date-only string (YYYY-MM-DD) for locale-appropriate display.
 */
export function formatDateOnly(dateStr: string, locale: Locale): string {
  try {
    const tag = locale === "zh-CN" ? "zh-CN" : "en-US";
    return new Date(dateStr + "T00:00:00").toLocaleDateString(tag, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a duration between two ISO timestamps as a human-readable string.
 */
export function formatDuration(created: string, updated: string | null, locale: Locale = "en-US"): string {
  const start = new Date(created).getTime();
  const end = updated ? new Date(updated).getTime() : Date.now();
  const diffMs = Math.max(0, end - start);
  const secs = Math.floor(diffMs / 1000);
  const isZh = locale === "zh-CN";
  if (secs < 60) return isZh ? `${secs}秒` : `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return isZh ? `${mins}分${secs % 60}秒` : `${mins}m ${secs % 60}s`;
  const hours = Math.floor(mins / 60);
  return isZh ? `${hours}时${mins % 60}分` : `${hours}h ${mins % 60}m`;
}

/**
 * Format a metric value (AUC/ASR/TPR) to a fixed number of decimal places.
 * Returns "--" for non-numeric values.
 */
export function formatMetricValue(value: number | undefined, digits = 3): string {
  return typeof value === "number" ? value.toFixed(digits) : "--";
}
