/**
 * Centralized status badge tone mapping
 * Ensures consistent colors across all views
 */

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export type StatusTone = "primary" | "success" | "warning" | "danger" | "neutral" | "info";

/**
 * Map job status to badge tone
 * Single source of truth for status colors
 */
export function getStatusTone(status: string): StatusTone {
  switch (status) {
    case "queued":
      return "primary";
    case "running":
      return "info";
    case "completed":
      return "success";
    case "failed":
      return "warning";
    case "cancelled":
      return "neutral";
    default:
      return "neutral";
  }
}
