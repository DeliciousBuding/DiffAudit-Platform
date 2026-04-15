/**
 * Centralized status badge tone mapping
 * Ensures consistent colors across all views
 */

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export type StatusTone = "primary" | "success" | "warning" | "danger" | "neutral";

/**
 * Map job status to badge tone
 * Single source of truth for status colors
 */
export function getStatusTone(status: JobStatus): StatusTone {
  switch (status) {
    case "queued":
      return "primary";
    case "running":
      return "primary";
    case "completed":
      return "success";
    case "failed":
      return "danger";
    case "cancelled":
      return "neutral";
    default:
      return "neutral";
  }
}
