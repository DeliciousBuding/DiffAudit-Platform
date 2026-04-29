import { sanitizeRuntimeText } from "@/lib/runtime-text";

export type AuditJobListPayload<T> = T[] | { jobs?: T[] | null };

export function normalizeAuditJobList<T>(payload: AuditJobListPayload<T> | unknown): T[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object" && "jobs" in payload) {
    const jobs = (payload as { jobs?: unknown }).jobs;
    if (Array.isArray(jobs)) {
      return jobs as T[];
    }
    if (jobs === null || jobs === undefined) {
      return [];
    }
  }

  return null;
}

export function sanitizeAuditJobValue<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeRuntimeText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeAuditJobValue(entry)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        sanitizeAuditJobValue(entry),
      ]),
    ) as T;
  }

  return value;
}

export function sanitizeAuditJobPayload<T>(payload: T): T {
  return sanitizeAuditJobValue(payload);
}
